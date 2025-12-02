import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'
import { uploadAttachment } from '~/middlewares/attachmentUploadMiddleware'
const Router = express.Router()

Router.route('/').post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)
Router.route('/:id').delete(authMiddleware.isAuthorized, cardController.deleteCard).put(authMiddleware.isAuthorized, multerUploadMiddleware.upload.single('cardCover'), cardValidation.update, cardController.update)
Router.put('/:id/attachment', authMiddleware.isAuthorized, uploadAttachment.single('attachment'), cardController.addAttachment)
Router.delete('/:id/attachments/:attId', authMiddleware.isAuthorized, cardController.deleteAttachment)

export const cardRoute = Router
