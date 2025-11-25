import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { toast } from 'react-toastify'
// Khoi tao gia tri cua 1 Slice trong Redux
const initialState = {
  currentUser: null
}

//Các hđ gọi api bất đồng bộ và cập nhật lại dữ liệu Redux, dùng Middleware createAsynThunk đi kèm với extraReducer
export const loginUserAPI = createAsyncThunk('user/loginUserAPI', async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/login`, data)
  // axios se tra ve ket qua ve qua property (data) cua no la data
  return response.data
})
//
export const logoutUserAPI = createAsyncThunk('user/logoutUserAPI', async (showSuccessMessage = true) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/users/logout`)
  if (showSuccessMessage) {
    toast.success('Logged out successfully!')
  }
  // axios se tra ve ket qua ve qua property (data) cua no la data
  return response.data
})

export const updateUserAPI = createAsyncThunk('user/updateUserAPI', async (data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/update`, data)
  return response.data
})
// Khoi tao 1 cai Slice trong kho luu tru Redux
export const userSlice = createSlice({
  name: 'user',
  initialState,
  //Reducers: Noi xu ly du lieu dong bo
  reducers: {},
  //extraReducers: nơi xử lý dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(loginUserAPI.fulfilled, (state, action) => {
      // action.payload o day chinh la response.data tra ve o tren
      const user = action.payload
      state.currentUser = user
    })
    builder.addCase(logoutUserAPI.fulfilled, (state) => {
      state.currentUser = null
    })
    builder.addCase(updateUserAPI.fulfilled, (state, action) => {
      const user = action.payload
      state.currentUser = user
    })
  }
})

// Action : là nơi dành cho các component bên dưới gọi bằng dispatch() tới nó để update lại dữ liệu thông qua reducer chạy đồng bộ
// export const {} = userSlice.actions

export const selectCurrentUser = (state) => {
  return state.user.currentUser
}
export const userReducer = userSlice.reducer
