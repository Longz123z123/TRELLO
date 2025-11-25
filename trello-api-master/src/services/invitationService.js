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

export const invitationService = {
  createNewBoardInvitation
}
