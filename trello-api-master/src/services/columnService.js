import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (reqBody) => {
  try {
    const newColumn= {
      ...reqBody

    }
    // Gọi tới tầng model để xử lý lưu bản ghi newColumn trong db
    const createdColumn = await columnModel.createNew(newColumn)
    // Lấy bản ghi Column sau khi gọi (tùy mục đích dự án có cần bản ghi này 0)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)
    // ...
    if (getNewColumn) {
      // xu ly cau truc data truoc khi du lieu tra ve
      getNewColumn.cards = []
      // Cap nhat lang mang columnOderIds trong collection boards
      await boardModel.pushColumnOrderIds(getNewColumn)
    }

    // tra ket qua ve trong service luon phai co return
    return getNewColumn
  } catch (error) { throw error }

}
const update = async (columnId, reqBody) => {
  try {
    const updateData= {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedColumn = await columnModel.update(columnId, updateData)

    return updatedColumn
  } catch (error) { throw error }
}

const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')

    }
    // Xoa column
    await columnModel.deleteOneById(columnId)
    // Xoa card thuoc toan bo column tren
    await cardModel.deleteManyByColumnId(columnId)
    // Xoa columnId trong mang columnOrderIds trong Board
    await boardModel.pullColumnOrderIds(targetColumn)
    return { deleteResult: 'Column and its Cards deleted successfully!' }
  } catch (error) { throw error }
}


export const columnService = {
  createNew,
  update,
  deleteItem

}