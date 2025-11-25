import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'

// --------------------------------------------
// Define 2 roles cho user
// --------------------------------------------
const USER_ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin'
}

// --------------------------------------------
// Collection name & schema
// --------------------------------------------
const USER_COLLECTION_NAME = 'users'

const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required(),

  username: Joi.string().required().trim().strict(),
  displayName: Joi.string().required().trim().strict(),

  avatar: Joi.string().default(null),

  /**
   * Tips:
   * Thay vì gọi lần lượt tất cả type của board để cho vào hàm valid() thì có thể viết gọn lại
   * bằng Object.values() kết hợp Spread Operator của JS.
   *
   * Cụ thể:  .valid(...Object.values(BOARD_TYPES))
   *
   * Làm như trên thì sau này dù các bạn có thêm hay sửa gì vào cái BOARD_TYPES trong file constants
   * thì những chỗ dùng Joi trong Model hay Validation cũng không cần phải đụng vào nữa.
   * Tối ưu gọn gàng luôn.
   */
  // role: Joi.string().valid(USER_ROLES.CLIENT, USER_ROLES.ADMIN).default(USER_ROLES.CLIENT),
  role: Joi.string()
    .valid(...Object.values(USER_ROLES))
    .default(USER_ROLES.CLIENT),
  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),

  _destroy: Joi.boolean().default(false)
})

// --------------------------------------------
// Các field không cho phép update
// --------------------------------------------
const INVALID_UPDATE_FIELDS = ['_id', 'email', 'username', 'createdAt']

// Validate tạo user
const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// --------------------------------------------
// Create user
// --------------------------------------------
const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData)

    return createdUser
  } catch (error) {
    throw new Error(error)
  }
}

// --------------------------------------------
// Find user by ID
// --------------------------------------------
const findOneById = async (userId) => {
  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(userId) })

    return result
  } catch (error) {
    throw new Error(error)
  }
}

// --------------------------------------------
// Find user by email
// --------------------------------------------
const findOneByEmail = async (emailValue) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email: emailValue })

    return result
  } catch (error) {
    throw new Error(error)
  }
}

// --------------------------------------------
// Update user
// --------------------------------------------
const update = async (userId, updateData) => {
  try {
    // Xóa các field không được update
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: updateData }, { returnDocument: 'after' })

    return result
  } catch (error) {
    throw new Error(error)
  }
}

// --------------------------------------------
// Export
// --------------------------------------------
export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  USER_ROLES,

  createNew,
  findOneById,
  findOneByEmail,
  update
}
