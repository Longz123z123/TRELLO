import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

/**
 * Khởi tạo giá trị mặc định của Slice trong Redux
 */
const initialState = {
  currentNotifications: null
}

/**
 * =============================
 *  ASYNC ACTIONS (createAsyncThunk)
 * =============================
 */

// Lấy danh sách invitations
export const fetchInvitationsAPI = createAsyncThunk('notifications/fetchInvitationsAPI', async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/invitations`)
  return response.data
})

// Cập nhật trạng thái lời mời (ACCEPT / REJECT)
export const updateBoardInvitationAPI = createAsyncThunk('notifications/updateBoardInvitationAPI', async ({ status, invitationId }) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/invitations/board/${invitationId}`, { status })
  return response.data
})

/**
 * =============================
 *  CREATE SLICE
 * =============================
 */

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearCurrentNotifications: (state) => {
      state.currentNotifications = null
    },
    updateCurrentNotifications: (state, action) => {
      state.currentNotifications = action.payload
    },
    addNotification: (state, action) => {
      const incomingInvitation = action.payload
      // unshift để thêm phần tử vào đầu mảng
      state.currentNotifications.unshift(incomingInvitation)
    }
  },

  /**
   * =============================
   *  EXTRA REDUCERS — xử lý asyncThunk
   * =============================
   */
  extraReducers: (builder) => {
    // Khi fetchInvitationsAPI thành công
    builder.addCase(fetchInvitationsAPI.fulfilled, (state, action) => {
      const incomingInvitations = action.payload
      // Hiển thị cái mới nhất lên đầu
      state.currentNotifications = Array.isArray(incomingInvitations) ? incomingInvitations.reverse() : []
    })

    // Khi updateBoardInvitationAPI thành công
    builder.addCase(updateBoardInvitationAPI.fulfilled, (state, action) => {
      const incomingInvitation = action.payload

      // Tìm invitation trong redux để cập nhật lại status mới
      const getInvitation = state.currentNotifications.find((i) => i._id === incomingInvitation._id)

      if (getInvitation) {
        getInvitation.boardInvitation = incomingInvitation.boardInvitation
      }
    })
  }
})

/**
 * =============================
 *  ACTION EXPORTS
 * =============================
 */
export const { clearCurrentNotifications, updateCurrentNotifications, addNotification } = notificationsSlice.actions

/**
 * =============================
 *  SELECTORS
 * =============================
 */
export const selectCurrentNotifications = (state) => state.notifications.currentNotifications

/**
 * =============================
 *  EXPORT REDUCER
 * =============================
 */
export const notificationsReducer = notificationsSlice.reducer
