// Params socket se dc lay tu thi vien socket.io
export const inviteUserToBoardSocket = (socket) => {
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    //Emit nguoc lai 1 su kien ve cho moi client khac (ngoai tru chinh nguoi req len)
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
}
