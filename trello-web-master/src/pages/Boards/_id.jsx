import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
// import { mockData } from '~/apis/mock-data'
import { useEffect } from 'react'
import { updateBoardDetailsAPI, updateColumnDetailsAPI, moveCardToDifColumnAPI } from '~/apis'
import { cloneDeep } from 'lodash'
import { fetchBoardDetailsAPI, updateCurrentActiveBoard, selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import ActiveCard from '~/components/Modal/ActiveCard/ActiveCard'
import { socketIoInstance } from '~/socketClient'
function Board() {
  // const [board, setBoard] = useState(null)
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)
  const { boardId } = useParams()
  useEffect(() => {
    // call API
    dispatch(fetchBoardDetailsAPI(boardId))
  }, [dispatch, boardId])
  // 2. Socket: join/leave room + lắng nghe BE_BOARD_UPDATED
  useEffect(() => {
    if (!boardId) return
    // console.log('[Board] FE_JOIN_BOARD:', boardId)
    socketIoInstance.emit('FE_JOIN_BOARD', boardId)

    const onBoardUpdated = (updatedBoardId) => {
      // console.log('[Board] Nhận BE_BOARD_UPDATED với boardId:', updatedBoardId)

      if (updatedBoardId !== boardId) return

      // Reload lại board
      dispatch(fetchBoardDetailsAPI(boardId))
    }

    socketIoInstance.on('BE_BOARD_UPDATED', onBoardUpdated)

    return () => {
      // console.log('[Board] FE_LEAVE_BOARD:', boardId)
      socketIoInstance.emit('FE_LEAVE_BOARD', boardId)
      socketIoInstance.off('BE_BOARD_UPDATED', onBoardUpdated)
    }
  }, [dispatch, boardId])
  // function nay co nv goi API va xu ly keo tha Column done
  const moveColumns = (dndOrderedColumns) => {
    // Cap nhat lai cho chuan du lieu state Board
    const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    dispatch(updateCurrentActiveBoard(newBoard))

    // goi API update board
    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: dndOrderedColumnsIds }).then(() => {
      socketIoInstance.emit('FE_BOARD_UPDATED', boardId)
    })
  }

  // khi di chuyen card trong cung column
  const moveCardInTheSameColumn = (dndOrderedCards, dndOrderCardIds, columnId) => {
    // Cap nhat lai cho chuan du lieu state Board
    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns.find((column) => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderCardIds
    }
    dispatch(updateCurrentActiveBoard(newBoard))

    // goi API update board
    updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderCardIds }).then(() => {
      socketIoInstance.emit('FE_BOARD_UPDATED', boardId)
    })
  }
  /**
   * Khi di chuyển card sang Column khác:
   * B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất là xóa cái _id của Card ra khỏi mảng)
   * B2: Cập nhật mảng cardOrderIds của Column tiếp theo (Hiểu bản chất là thêm _id của Card vào mảng)
   * B3: Cập nhật lại trường columnId mới của cái Card đã kéo
   * => Làm một API support riêng.
   */
  const moveCardToDifColumn = (currentCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
    // Cap nhat lai cho chuan du lieu state Board
    const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    dispatch(updateCurrentActiveBoard(newBoard))
    // goi API xu ly BE
    let prevCardOrderIds = dndOrderedColumns.find((column) => column._id === prevColumnId)?.cardOrderIds
    // Xu ly van de khi keo Card cuoi cung ra khoi column.
    // Column rong se co placeholder-card can xoa di truoc khi gui du lieu cho BE, neu giu se bi loi ko phai ObjectId
    if (prevCardOrderIds[0].includes('placeholder-card')) prevCardOrderIds = []
    moveCardToDifColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find((column) => column._id === nextColumnId)?.cardOrderIds
    }).then(() => {
      socketIoInstance.emit('FE_BOARD_UPDATED', boardId)
    })
  }

  //
  if (!board) {
    return <PageLoadingSpinner caption="Loading Board..." />
  }
  return (
    <>
      <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
        <ActiveCard />
        <AppBar />
        <BoardBar board={board} />
        <BoardContent
          board={board}
          // createNewColumn={createNewColumn}
          // createNewCard={createNewCard}
          // deleteColumnDetails={deleteColumnDetails}
          //3 cái trường hợp move giữ nguyên kéo thả ở boardcontent để 0 bị quá dài
          moveColumns={moveColumns}
          moveCardInTheSameColumn={moveCardInTheSameColumn}
          moveCardToDifColumn={moveCardToDifColumn}
        />
      </Container>
    </>
  )
}

export default Board
