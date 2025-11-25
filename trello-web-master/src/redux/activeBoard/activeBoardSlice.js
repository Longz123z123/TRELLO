import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { mapOrder } from '~/utils/sorts'
import { isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formmatters'

// Khoi tao gia tri cua 1 Slice trong Redux
const initialState = {
  currentActiveBoard: null
}

//Các hđ gọi api bất đồng bộ và cập nhật lại dữ liệu Redux, dùng Middleware createAsynThunk đi kèm với extraReducer
export const fetchBoardDetailsAPI = createAsyncThunk('activeBoard/fetchBoardDetailsAPI', async (boardId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)
  // axios se tra ve ket qua ve qua property (data) cua no la data
  return response.data
})
// Khoi tao 1 cai Slice trong kho luu tru Redux
export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  //Reducers: Noi xu ly du lieu dong bo
  reducers: {
    updateCurrentActiveBoard: (state, action) => {
      const board = action.payload //action.payload la chuan dat ten dulieu vao reducer, o day chung ta gan no ra mot cai bien co y nghia hon

      //Xu ly du lieu neu can thiet..
      //..

      // Update lai du lieu cua currentActiceBoard
      state.currentActiveBoard = board
    },
    updateCardInBoard: (state, action) => {
      //update nested data
      const incomingCard = action.payload
      // Tim tu board => column
      const column = state.currentActiveBoard.columns.find((i) => i._id === incomingCard.columnId)
      if (column) {
        const card = column.cards.find((i) => i._id === incomingCard._id)
        if (card) {
          // card.title = incomingCard.title
          // card['title'] = incomingCard.['title']
          Object.keys(incomingCard).forEach((key) => {
            card[key] = incomingCard[key]
          })
        }
      }
    }
  },
  //extraReducers: nơi xử lý dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
      // action.payload o day chinh la response.data tra ve o tren
      let board = action.payload
      // Thành viên trong cái board gộp lại 2 mảng owner và members
      board.FE_allUsers = board.owners.concat(board.members)
      //Xu ly du lieu neu can thiet..
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')

      board.columns.forEach((column) => {
        // khi f5 can xu ly keo tha vao column rong
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        } else {
          // sap xep thu tu card luon o day truoc khi dua du lieu xuong ben duoi cac compenent con vd 71
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })

      // Update lai du lieu cua currentActiceBoard
      state.currentActiveBoard = board
    })
  }
})

// Action : là nơi dành cho các component bên dưới gọi bằng dispatch() tới nó để update lại dữ liệu thông qua reducer chạy đồng bộ
export const { updateCurrentActiveBoard, updateCardInBoard } = activeBoardSlice.actions

//Selector : là nơi dành cho các component bên dưới gọi bằng hook useSelector() để lấy dữ liệu trong kho Redux store ra sử dụng
export const selectCurrentActiveBoard = (state) => {
  return state.activeBoard.currentActiveBoard
}
// export default activeBoardSlice.reducer
export const activeBoardReducer = activeBoardSlice.reducer
