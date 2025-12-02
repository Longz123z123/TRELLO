// src/sockets/boardRealtimeSocket.js

// Nhận cả io và socket
export const boardRealtimeSocket = (io, socket) => {
  // FE báo: tôi vừa vào board này, cho tôi join room
  socket.on('FE_JOIN_BOARD', (boardId) => {
    if (!boardId) return
    const roomName = `board_${boardId}`
    socket.join(roomName)
    // console.log(`Socket ${socket.id} joined room: ${roomName}`)
  })

  // FE báo: tôi rời board này
  socket.on('FE_LEAVE_BOARD', (boardId) => {
    if (!boardId) return
    const roomName = `board_${boardId}`
    socket.leave(roomName)
    // console.log(`Socket ${socket.id} left room: ${roomName}`)
  })

  // FE báo: board này vừa được cập nhật (thêm/sửa/xoá/kéo thả)
  socket.on('FE_BOARD_UPDATED', (boardId) => {
    if (!boardId) return
    const roomName = `board_${boardId}`

    // Gửi cho TẤT CẢ client trong room (bao gồm cả thằng emit)
    io.to(roomName).emit('BE_BOARD_UPDATED', boardId)
    // console.log(`Board ${boardId} updated → broadcast BE_BOARD_UPDATED to room: ${roomName}`)
  })
}
