import express from 'express'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
const Router = express.Router()

Router.route('/').get(authMiddleware.isAuthorized, boardController.getBoards).post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew)

Router.route('/:id').get(authMiddleware.isAuthorized, boardController.getDetails).put(authMiddleware.isAuthorized, boardValidation.update, boardController.update) // update
// API ho tro move card giua cac column dif trong cung 1 board
Router.route('/supports/moving_cards').put(authMiddleware.isAuthorized, boardValidation.moveCardToDifColumn, boardController.moveCardToDifColumn)

export const boardRoute = Router
