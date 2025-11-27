import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'
const createNew = async (req, res, next) => {
  try {
    // Dieu huong du lieu sang tang service
    const userId = req.jwtDecoded._id

    const createdBoard = await boardService.createNew(userId, req.body)

    // Co ket qua tra ve phia Client
    res.status(StatusCodes.CREATED).json(createdBoard)
    // throw new ApiError(StatusCodes.BAD_GATEWAY, 'zettdev testt erro')
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const updatedBoard = await boardService.update(boardId, req.body)

    res.status(StatusCodes.OK).json(updatedBoard)
  } catch (error) {
    next(error)
  }
}

const moveCardToDifColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifColumn(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}
const getDetails = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id

    // console.log(req.params)
    const boardId = req.params.id
    const board = await boardService.getDetails(userId, boardId)
    res.status(StatusCodes.OK).json(board)
  } catch (error) {
    next(error)
  }
}
const getBoards = async (req, res, next) => {
  try {
    // console.log(req.params)
    const userId = req.jwtDecoded._id
    const { page, itemsPerPage, q } = req.query
    const queryFilters = q
    console.log(queryFilters)
    const result = await boardService.getBoards(userId, page, itemsPerPage, queryFilters)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDifColumn,
  getBoards
}
