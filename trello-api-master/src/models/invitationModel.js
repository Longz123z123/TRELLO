import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { userModel } from './userModel'
import { boardModel } from './boardModel'
// ---------------------------
//  Define Collection (name & schema)
// ---------------------------
export const INVITATION_COLLECTION_NAME = 'invitations'

export const INVITATION_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE), // nguoi di moi
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE), // nguoi dc moi

  type: Joi.string()
    .required()
    .valid(...Object.values(INVITATION_TYPES)),

  boardInvitation: Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string()
      .required()
      .valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// ---------------------------
//  Validate before create
// ---------------------------
const INVALID_UPDATE_FIELDS = ['_id', 'inviterId', 'inviteeId', 'type', 'createdAt'] //chi dinh ~ filed k mun update

const validateBeforeCreate = async (data) => {
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// ---------------------------
//  Create new board invitation
// ---------------------------
const createNewBoardInvitation = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    let newInvitationToAdd = {
      ...validData,
      inviterId: new ObjectId(validData.inviterId),
      inviteeId: new ObjectId(validData.inviteeId)
    }

    // Nếu là lời mời board → convert boardId sang ObjectId
    if (validData.boardInvitation) {
      newInvitationToAdd.boardInvitation = {
        ...validData.boardInvitation,
        boardId: new ObjectId(validData.boardInvitation.boardId)
      }
    }

    const createdInvitation = await GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(newInvitationToAdd)

    return createdInvitation
  } catch (error) {
    throw new Error(error)
  }
}

// ---------------------------
//  Find by Id
// ---------------------------
const findOneById = async (invitationId) => {
  try {
    const result = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(invitationId) })

    return result
  } catch (error) {
    throw new Error(error)
  }
}

// ---------------------------
//  Update invitation
// ---------------------------
const update = async (invitationId, updateData) => {
  try {
    // Loại bỏ những field không cho phép update
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    // Convert ObjectId trong boardInvitation nếu có
    if (updateData.boardInvitation) {
      updateData.boardInvitation = {
        ...updateData.boardInvitation,
        boardId: new ObjectId(updateData.boardInvitation.boardId)
      }
    }

    const result = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .findOneAndUpdate({ _id: new ObjectId(invitationId) }, { $set: updateData }, { returnDocument: 'after' })

    return result
  } catch (error) {
    throw new Error(error)
  }
}
//query tong hop lay ~ ban ghi invation thuoc ve 1 user cu the
const findByUser = async (userId) => {
  try {
    // const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    const queryConditions = [{ inviteeId: new ObjectId(userId) }, { _destroy: false }]
    const results = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .aggregate([
        { $match: { $and: queryConditions } },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'inviterId',
            foreignField: '_id',
            as: 'inviter',
            pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'inviteeId',
            foreignField: '_id',
            as: 'invitee',
            pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
          }
        },
        {
          $lookup: {
            from: boardModel.BOARD_COLLECTION_NAME,
            localField: 'boardInvitation.boardId',
            foreignField: '_id',
            as: 'board'
          }
        }
      ])
      .toArray()
    return results
  } catch (error) {
    throw new Error(error)
  }
}

export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA,
  createNewBoardInvitation,
  findOneById,
  update,
  findByUser
}
