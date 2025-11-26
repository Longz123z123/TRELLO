import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPE } from '~/utils/constants'
import { ObjectId } from 'mongodb'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { pagingSkipValue } from '~/utils/algorithms'
import { userModel } from './userModel'
// Define Collection (name & schema)
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPE.PUBLIC, BOARD_TYPE.PRIVATE).required(),

  // Lưu ý các item trong mảng columnOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé,  video số 57
  columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  ownerIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  memberIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Chỉ định những cái trường 0 cho phép cập nhật trong hàm update
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}
const createNew = async (userId, data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newBoardToAdd = {
      ...validData,
      ownerIds: [new ObjectId(userId)]
    }
    const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoardToAdd) // hàm insertOne lưu vào db của MongoDB
    return createdBoard
  } catch (error) {
    throw new Error(error)
  }
}
const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id)
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}
// Query tong hop (aggregate) để lấy toàn bộ column và card thuộc về board
const getDetails = async (userId, boardId) => {
  try {
    // const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    const queryConditions = [
      { _id: new ObjectId(boardId) },
      { _destroy: false },
      {
        $or: [{ ownerIds: { $all: [new ObjectId(userId)] } }, { memberIds: { $all: [new ObjectId(userId)] } }]
      }
    ]
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        { $match: { $and: queryConditions } },
        {
          $lookup: {
            from: columnModel.COLUMN_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'columns'
          }
        },
        {
          $lookup: {
            from: cardModel.CARD_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'cards'
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME, // Tên collection User
            localField: 'ownerIds', // Mảng chứa ID user trong Board
            foreignField: '_id', // So sánh với _id trong User
            as: 'owners', // Kết quả sẽ lưu vào field "owners"
            //pipeline trong lookup để xử lý 1 or nhìu luồng cần thiết
            // project: loại bỏ các trường nhạy cảm không muốn trả về
            pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
          }
        },

        // Lookup danh sách Member của Board
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'memberIds',
            foreignField: '_id',
            as: 'members',
            pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
          }
        }
      ])
      .toArray()
    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}

// Push gia tri ColumnId vao cuoi mang columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        { $push: { columnOrderIds: new ObjectId(column._id) } },
        { returnDocument: 'after' } // ttra ve ket qua moi sau khi cap nhat
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Lay 1 phan tu columnId ra khoi mang columnOrderIds dung $pull trong mongoDB
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        { $pull: { columnOrderIds: new ObjectId(column._id) } },
        { returnDocument: 'after' } // ttra ve ket qua moi sau khi cap nhat
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (boardId, updateData) => {
  try {
    // Loc nhung field ma chung ta khong cho phep update
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })
    // Đối với những dữ liệu cần biến đổi ObjectId  ở đây
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map((_id) => new ObjectId(_id))
    }

    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate({ _id: new ObjectId(boardId) }, { $set: updateData }, { returnDocument: 'after' })
    return result
  } catch (error) {
    throw new Error(error)
  }
}
const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const queryConditions = [
      // DK1: Board chua bi xoa
      { _destroy: false },
      // DK2: Phai la owner or member cua board do, su dung toan tu $all cua mongodb
      {
        $or: [{ ownerIds: { $all: [new ObjectId(userId)] } }, { memberIds: { $all: [new ObjectId(userId)] } }]
      }
    ]

    // Pipeline rieng cho de doc
    const pipeline = [
      { $match: { $and: queryConditions } },
      { $sort: { title: 1 } }, // sx theo thu tu A-Z (se ket hop collation de sort so 1,2,10,...)
      // facet xu ly nhieu luong trong 1 query
      {
        $facet: {
          // Luong 1 nhat: query boards
          queryBoards: [
            { $skip: pagingSkipValue(page, itemsPerPage) }, // bỏ qua số lượng bản ghi trước đó
            { $limit: itemsPerPage } // giới hạn số lượng bản ghi trên mỗi trang
          ],
          // Luong 2: query dem tong so luong boards trong db
          queryTotalBoards: [{ $count: 'countedAllBoards' }]
        }
      }
    ]

    const [res = { queryBoards: [], queryTotalBoards: [] }] = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate(pipeline, {
        // collation: fix B hoa dung truoc a thuong + sort so theo thu tu 1,2,10,...
        collation: {
          locale: 'en',
          strength: 2, // khong phan biet hoa / thuong
          numericOrdering: true // "Board 2" < "Board 10"
        }
      })
      .toArray()

    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }
  } catch (error) {
    throw new Error(error)
  }
}
const pushMembersIds = async (boardId, userId) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(boardId) },
        { $push: { memberIds: new ObjectId(userId) } },
        { returnDocument: 'after' } // ttra ve ket qua moi sau khi cap nhat
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}
export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds,
  getBoards,
  pushMembersIds
}
