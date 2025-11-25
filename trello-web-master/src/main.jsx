import ReactDOM from 'react-dom/client'
import App from '~/App.jsx'
import CssBaseline from '@mui/material/CssBaseline'
import GlobalStyles from '@mui/material/GlobalStyles'
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import theme from '~/theme'
// cau hinh react-toastify
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
// cau hinh ConfirmProvider
import { ConfirmProvider } from 'material-ui-confirm'
// cau hinh redux store
import { Provider } from 'react-redux'
import { store } from '~/redux/store'
// cau hinh react router dom với browserrouter
import { BrowserRouter } from 'react-router-dom'
// cau hinh redux persist
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
const persistor = persistStore(store)
// Ky thuat Inject Store la ky thuat su dung bien redux store ngoai pham vi component jsx
import { injectStore } from '~/utils/authorizeAxios'
injectStore(store)
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter basename="/">
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <CssVarsProvider theme={theme}>
          <ConfirmProvider
            defaultOptions={{
              allowClose: false,
              dialogProps: { maxWidth: 'xs' },
              buttonOrder: ['confirm', 'cancel'],
              confirmationButtonProps: { color: 'success', variant: 'outlined' },
              cancellationButtonProps: { color: 'inherit' }
            }}
          >
            <GlobalStyles styles={{ a: { textDecoration: 'none' } }} />
            <CssBaseline />
            <App />
            <ToastContainer position="bottom-right" theme="colored" />
          </ConfirmProvider>
        </CssVarsProvider>
      </PersistGate>
    </Provider>
  </BrowserRouter>
)
