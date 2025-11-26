// Redux: State management tool
import { configureStore } from '@reduxjs/toolkit'
import { activeBoardReducer } from './activeBoard/activeBoardSlice'
import { userReducer } from './user/userSlice'
import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { activeCardReducer } from './activeCard/activeCardSlice'
import { notificationsReducer } from './notifications/notificationsSlice'
// cau hinh persist
const rootPersistConfig = {
  key: 'root',
  storage: storage,
  whitelist: ['user'] // dinh nghia slice dc phep duy tri qua moi lan F5 trinh duyet
}
// combine cac reducers trong du an
const reducers = combineReducers({
  activeBoard: activeBoardReducer,
  user: userReducer,
  activeCard: activeCardReducer,
  notifications: notificationsReducer
})
// Thuc hien presist reducers
const persistedReducer = persistReducer(rootPersistConfig, reducers)

export const store = configureStore({
  reducer: persistedReducer,
  //fix warning error when redux-persist
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
})
