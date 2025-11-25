import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import {
  DndContext,
  // PointerSensor,
  useSensor,
  // MouseSensor,
  // TouchSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  pointerWithin,
  getFirstCollision,
  closestCenter
} from '@dnd-kit/core'
import { MouseSensor, TouchSensor } from '~/customLibraries/DnDKitSensors'
import { useEffect, useState, useCallback, useRef } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formmatters'
const ACTIVE_DRAG_ITEM_STYLE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_STYLE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_STYLE_CARD'
}
function BoardContent({
  board,
  moveColumns,
  moveCardInTheSameColumn,
  moveCardToDifColumn
}) {
  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  // yeu cau chuot di chuyen 10px moi kick hoat event, fix truong hop click bi goi event
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 }
  })
  // Nhắn giữ 250ms và dung sai   của cảm ứng (di chuyển chênh lệch 5px mới kích hoạt event)
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 500 }
  })

  // const mySensors = useSensors(pointerSensor)
  // ưu tiên sd mouse touch sensor để có trải nghiệm mobile tốt nhất ko bị bug
  const mySensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])
  // Cùng 1 thời điểm chỉ có 1 ptu đc kéo column or card
  const [activeDragItemId, setActiveDragItemId] = useState([null])
  const [activeDragItemType, setActiveDragItemType] = useState([null])
  const [activeDragItemData, setActiveDragItemData] = useState([null])
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState([
    null
  ])
  // Diem va cham cuoi cung xly thuat toan phat hien va cham
  const lastOverId = useRef(null)

  useEffect(() => {
    // column da dc sap xep o th cha _id.jsx cao nhat VD71
    setOrderedColumns(board.columns)
  }, [board])

  const findColumnByCardId = (cardId) => {
    return orderedColumns.find((column) =>
      column?.cards?.map((card) => card._id)?.includes(cardId)
    )
  }
  // Function chung Cập nhật lại stattes khi di chuyển card giữa các column khác nhau
  const moveCardBetweenDifColumn = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData,
    triggerFrom
  ) => {
    setOrderedColumns((prevColumns) => {
      // Tìm vị trí index của overCard trong column đích đến
      const overCardIndex = overColumn?.cards?.findIndex(
        (card) => card._id === overCardId
      )

      // Logic tính toán lấy vị trí cardIndex mới. logic lấy từ thư viện dndkit
      let newCardIndex
      const isBelowOverItem =
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex =
        overCardIndex >= 0
          ? overCardIndex + modifier
          : overColumn?.cards.length + 1
      // CLone sâu , mới ra hoàn toàn
      const nextColumns = cloneDeep(prevColumns)
      const nextActiveColumn = nextColumns.find(
        (column) => column._id === activeColumn._id
      )
      const nextOverColumn = nextColumns.find(
        (column) => column._id === overColumn._id
      )
      // nextActiveColumn: Column cũ
      if (nextActiveColumn) {
        // Xóa card ở colummn cũ , lúc kéo để sang column khác
        nextActiveColumn.cards = nextActiveColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        )
        // Thêm placeholder card nếu column rỗng khi kéo hết card đi
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        }
        // Cập nhật lại mảng cardOrderIds cho chuẩn data
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(
          (card) => card._id
        )
      }
      // nextOverColumn: Column  mới
      if (nextOverColumn) {
        // Kiểm tra xem card đang kéo có tồn tại overcolumn chưa, nếu có thì xóa nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        )
        // Phải cập nhật lại chuẩn hóa dữ liệu trong card khi kéo card giữa 2 column khác
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        }
        // Tiếp theo thêm card mới đang kéo vào overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(
          newCardIndex,
          0,
          rebuild_activeDraggingCardData
        )
        // Xoa placeholdercard di neu no ton tai
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => !card.FE_PlaceholderCard
        )
        // Cập nhật lại mảng cardOrderIds cho chuẩn data
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(
          (card) => card._id
        )
      }
      // Neu function nay dc goi tu handleDragEnd la da keo xong, luc nay goi API 1 lan o day
      if (triggerFrom === 'handleDragEnd') {
        /**
         * - Gọi lên props function moveCardToDifferentColumn nằm ở component cha cao nhất (boards/_id.jsx)
         * - Lưu ý: Về sau ở học phần MERN Stack Advance nâng cao, học trực tiếp, mình sẽ với mình thì chúng ta sẽ đưa
         *   dữ liệu Board ra ngoài Redux Global Store,
         *   và lúc này chúng ta có thể gọi luôn API ở đây là xong thay vì phải lần lượt gọi ngược lên những
         *   component cha phía bên trên. (Đối với component con nằm càng sâu thì càng khổ :D)
         *   - Với việc sử dụng Redux như vậy thì code sẽ Clean chuẩn chỉnh hơn rất nhiều.
         */
        // Phải dùng tới activeDragItemData.columnId hoặc tốt nhất là oldColumnWhenDraggingCard._id
        // (set vào state từ bước handleDragStart) chứ không phải activeData trong scope handleDragEnd này
        // vì sau khi đi qua onDragOver và tới đây là state của card đã bị cập nhật một lần rồi.

        moveCardToDifColumn(
          activeDraggingCardId,
          oldColumnWhenDraggingCard._id,
          nextOverColumn._id,
          nextColumns
        )
      }
      return nextColumns
    })
  }
  //  Trigger Khi bắt đầu kéo 1 ptu
  const handleDragStart = (event) => {
    // console.log('handleDragStart: ', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(
      event?.active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_STYLE.CARD
        : ACTIVE_DRAG_ITEM_STYLE.COLUMN
    )
    setActiveDragItemData(event?.active?.data?.current)
    // neu keo card thi moi set gia tri oldColumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }
  ///  Trigger Khi trong quá trình khi đang kéo 1 ptu
  const handleDragOver = (event) => {
    // Không làm gì thêm nếu kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_STYLE.COLUMN) return
    // Còn nếu kéo card xử lý thêm để can kéo card qua lại giữa các column
    // console.log('handleDragOver: ', event)
    const { active, over } = event
    if (!active || !over) return // neu 0 ton tai active or over = null return

    const {
      id: activeDraggingCardId,
      data: { current: activeDraggingCardData }
    } = active
    const { id: overCardId } = over
    // Tim 2 id cua column
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)
    if (!activeColumn || !overColumn) return
    // Xử lý logic chỉ khi kéo 2 card khác column với nhau (chỉ trong quá trình kéo)
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifColumn(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData,
        'handleDragOver'
      )
    }
  }
  ///Trigger Khi kết thúc kéo 1 ptu
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!active || !over) return // neu 0 ton tai active or over = null return
    // console.log('handleDragEnd: ', event)
    // Xu ly keo tha card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_STYLE.CARD) {
      const {
        id: activeDraggingCardId,
        data: { current: activeDraggingCardData }
      } = active
      const { id: overCardId } = over
      // Tim 2 id cua column
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      if (!activeColumn || !overColumn) return
      // Hành động kéo thả card giữa 2 column khác nhau

      // Hành động kéo thả card khác column
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifColumn(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData,
          'handleDragEnd'
        )
      }
      // Hành động kéo thả card cùng 1 column
      else {
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(
          (c) => c._id === activeDragItemId
        ) // lay vi tri cu tu oldColumnWhenDragging
        const newCardIndex = overColumn?.cards?.findIndex(
          (c) => c._id === overCardId
        ) // lay vi tri cu tu active
        const dndOrderedCards = arrayMove(
          oldColumnWhenDraggingCard?.cards,
          oldCardIndex,
          newCardIndex
        ) // dung arraymode để sx card trong cùng 1 column ban đầu
        const dndOrderCardIds = dndOrderedCards.map((card) => card._id)

        setOrderedColumns((prevColumns) => {
          // CLone sâu , mới ra hoàn toàn
          const nextColumns = cloneDeep(prevColumns)
          // Tìm tới column đang thả
          const targetColumn = nextColumns.find(
            (column) => column._id === overColumn._id
          )
          // Cập nhật lại giá trị mới của card và cardOrderIds trong cùng targetColumn
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderCardIds
          // console.log('targetColumn: ', targetColumn)
          return nextColumns
        })
        //
        moveCardInTheSameColumn(
          dndOrderedCards,
          dndOrderCardIds,
          oldColumnWhenDraggingCard._id
        )
      }
    }
    // Xu ly keo tha Column trong cung 1 board content
    if (activeDragItemType === ACTIVE_DRAG_ITEM_STYLE.COLUMN) {
      // neu vi tri sau khi keo tha != vi tri ban dau
      if (active.id !== over.id) {
        const oldColumnIndex = orderedColumns.findIndex(
          (c) => c._id === active.id
        ) // lay vi tri cu tu active
        const newColumnIndex = orderedColumns.findIndex(
          (c) => c._id === over.id
        ) // lay vi tri cu tu active
        const dndOrderedColumns = arrayMove(
          orderedColumns,
          oldColumnIndex,
          newColumnIndex
        ) // dung arraymode để sx mảnh column ban đầu
        setOrderedColumns(dndOrderedColumns) // cap nhat lai state column sau khi keo tha de tranh delay or flickering
        //
        moveColumns(dndOrderedColumns)
      }
    }

    // nhung du lieu sau khi keo tha nay luon phai dua ve null mac dinh ban dau
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }
  const CustomDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.5' } }
    })
  }
  // args = arguments = cac doi so, tham so
  const collisionDetectionStrategy = useCallback(
    (args) => {
      // console.log('collisionDetectionStrategy', collisionDetectionStrategy)
      // TH keo column thi dung thuat ttoan ClosestCorners la chuan nhat
      if (activeDragItemType === ACTIVE_DRAG_ITEM_STYLE.COLUMN) {
        return closestCorners({ ...args })
      }
      // tim cac diem giao nhau, va nhau - inttersections voi con tro
      const pointerIntersections = pointerWithin(args)
      // Kéo một cái card không nằm trong khu vực kéo thả thì return
      if (!pointerIntersections?.length) return
      // Thuật toán phát hiện va chạm sẽ trả về 1 mảng va chạm ở đây
      // const intersections = pointerIntersections?.length > 0 ? pointerIntersections : rectIntersection(args)
      // Tìm overid đầu tiên trong đám intersection
      let overId = getFirstCollision(pointerIntersections, 'id')
      if (overId) {
        const checkColumn = orderedColumns.find(
          (column) => column._id === overId
        )
        if (checkColumn) {
          // console.log('over id default', overId)
          overId = closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) => {
                return (
                  container.id !== overId &&
                  checkColumn?.cardOrderIds?.includes(container.id)
                )
              }
            )
          })[0]?.id
          // console.log('over id after', overId)
        }
        lastOverId.current = overId
        return [{ id: overId }]
      }
      // Neu overId la null thi tra ve mang rong - tranh bug
      return lastOverId.current ? [{ id: lastOverId.current }] : []
    },
    [activeDragItemType, orderedColumns]
  )

  return (
    <DndContext
      sensors={mySensors}
      // Nếu chỉ dùng closestCorners sẽ có bug flickering + sai lệch dữ liệu (VD 37)
      collisionDetection={collisionDetectionStrategy}
      // collisionDetection={closestCorners} // thuật toán phát hiện va chạm. nếu k có thì card với cover lớn sẽ ko kéo qua column khác đc
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
    >
      <Box
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? '#34495e' : '#1976d2',
          width: '100%',
          height: (theme) => theme.trello.boardContentHeight,
          p: '10px 0'
        }}
      >
        {/* /* // DragOverlay hiển thị bóng mờ của phần tử đang được kéo (dragging preview)
        // Nếu không có phần tử nào đang được kéo => không hiển thị gì
        // Nếu đang kéo một column => hiển thị component Column với dữ liệu kéo hiện tại
        // Nếu đang kéo một card => hiển thị component Card với dữ liệu kéo hiện tại */}
        <ListColumns columns={orderedColumns} />
        <DragOverlay dropAnimation={CustomDropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DRAG_ITEM_STYLE.COLUMN && (
            <Column column={activeDragItemData} />
          )}
          {activeDragItemType === ACTIVE_DRAG_ITEM_STYLE.CARD && (
            <Card card={activeDragItemData} />
          )}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
