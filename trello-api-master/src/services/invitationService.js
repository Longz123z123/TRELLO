import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // Người đi mời: chính là người đang request, lấy từ token
    const inviter = await userModel.findOneById(inviterId)

    // Người được mời: tìm theo email phía FE gửi lên
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)

    // Tìm board ra để xử lý
    const board = await boardModel.findOneById(reqBody.boardId)

    // Nếu thiếu 1 trong 3, reject ngay
    if (!inviter || !invitee || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!')
    }

    // Tạo data để lưu
    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(), // chuyển ObjectId → string vi sang ben model co check lai data
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    }

    // Lưu vào DB
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)

    // Lấy lại dữ liệu sau khi insert
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId)

    // Format dữ liệu trả về
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }

    return resInvitation
  } catch (error) {
    throw error
  }
}

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)
    // Vì các dữ liệu inviter, invitee và board đang ở giá trị mảng 1 phần tử nếu lấy ra được
    // nên chúng ta biến đổi nó về JSON Object trước khi trả về cho phía FE
    const resInvitaion = getInvitations.map((i) => {
      return {
        ...i,
        inviter: i.inviter[0] || {},
        invitee: i.invitee[0] || {},
        board: i.board[0] || {}
      }
    })
    return resInvitaion
  } catch (error) {
    throw error
  }
}
const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    const getInvitation = await invitationModel.findOneById(invitationId)
    if (!getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!')
    // Sau khi co getInvitation roi thi lay full data cua board
    const boardId = getInvitation.boardInvitation.boardId
    const getBoard = await boardModel.findOneById(boardId)
    if (!getBoard) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    // Kiểm tra xem nếu status là ACCEPTED mà user (invitee) đã là owner hoặc member
    // của board rồi thì trả về thông báo lỗi ngay.
    // Note: 2 mảng memberIds và ownerIds của board đang là kiểu dữ liệu ObjectId,
    // nên nhớ convert sang String hết để check cho chính xác.
    const boardOwnerAndMemberIds = [...getBoard.ownerIds, ...getBoard.memberIds].toString()

    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already a member of this board!')
    }
    const updateData = {
      boardInvitation: { ...getInvitation.boardInvitation, status: status }
    }

    //B1: Update status trong ban ghi Invitation
    const updatedInvitation = await invitationModel.update(invitationId, updateData)
    //B2: Neu accept success, thi can phai them thong tin cua user vao ban ghi memberids trong board
    if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMembersIds(boardId, userId)
    }
    return updatedInvitation
  } catch (error) {
    throw error
  }
}
export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
}
