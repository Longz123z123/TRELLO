import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody
    }
    // Gọi tới tầng model để xử lý lưu bản ghi newCard trong db
    const createdCard = await cardModel.createNew(newCard)
    // Lấy bản ghi Card sau khi gọi (tùy mục đích dự án có cần bản ghi này 0)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)
    // ...
    if (getNewCard) {
      // Cap nhat lai mang cardOderIds trong collection columns
      await columnModel.pushCardOrderIds(getNewCard)
    }
    // tra ket qua ve trong service luon phai co return
    return getNewCard
  } catch (error) {
    throw error
  }
}

const update = async (cardId, reqBody, cardCoverFile, userInfor) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    let updatedCard = {}
    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url
      })
    } else if (updateData.commentToAdd) {
      // Tao du lieu comment de luu vao db
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfor._id,
        userEmail: userInfor.email
      }
      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)
    } else {
      // cac truong hop update chung : title,des,...
      updatedCard = await cardModel.update(cardId, updateData)
    }
    return updatedCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
  update
}
