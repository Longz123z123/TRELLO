import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'
import { ObjectId } from 'mongodb'

const createNew = async (req, res, next) => {
  try {
    const createdCard = await cardService.createNew(req.body)
    // Co ket qua tra ve phia Client
    res.status(StatusCodes.CREATED).json(createdCard)
  } catch (error) {
    next(error)
  }
}
const update = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const cardCoverFile = req.file
    const userInfor = req.jwtDecoded
    const updatedCard = await cardService.update(cardId, req.body, cardCoverFile, userInfor)
    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) {
    next(error)
  }
}
const deleteCard = async (req, res, next) => {
  try {
    const cardId = req.params.id
    await cardService.deleteCard(cardId)

    res.status(StatusCodes.OK).json({
      deleteResult: 'Card deleted successfully',
      cardId
    })
  } catch (error) {
    next(error)
  }
}
const addAttachment = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const user = req.jwtDecoded // thông tin user từ token
    const file = req.file // file upload từ multer

    if (!file) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'No attachment uploaded' })
    }

    // Data để push vào mảng attachments trong card
    const attachmentData = {
      _id: new ObjectId(),
      fileName: file.originalname,
      filePath: `uploads/attachments/${file.filename}`,
      fileType: file.mimetype,
      createdAt: Date.now(),
      createdBy: user._id
    }

    const updatedCard = await cardService.addAttachment(cardId, attachmentData)

    return res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) {
    next(error)
  }
}
const deleteAttachment = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const attachmentId = req.params.attId

    const updatedCard = await cardService.deleteAttachment(cardId, attachmentId)

    return res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) {
    next(error)
  }
}
export const cardController = {
  createNew,
  update,
  deleteCard,
  addAttachment,
  deleteAttachment
}
