import axios from 'axios'
import { toast } from 'react-toastify'
import { interceptorLoadingElements } from '~/utils/formmatters'
import { refreshTokenAPI } from '~/apis'
import { logoutUserAPI } from '~/redux/user/userSlice'

// Ky thuat Inject Store la ky thuat su dung bien redux store ngoai pham vi component jsx
let axiosReduxStore
export const injectStore = (mainStore) => {
  axiosReduxStore = mainStore
}
// Khởi tạo một instance Axios (authorizedAxiosInstance) để tùy chỉnh cấu hình dùng chung cho toàn dự án.
let authorizedAxiosInstance = axios.create()
// Timeout: giới hạn thời gian chờ tối đa cho mỗi request — ở đây đặt là 10 phút.
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10
// withCredentials: cho phép Axios tự động gửi kèm cookie trong mọi request lên BE (phục vụ cơ chế lưu JWT tokens — refresh & access — trong HttpOnly Cookie của trình duyệt).
authorizedAxiosInstance.defaults.withCredentials = true

// Cấu hình Interceptor (bộ đánh chặn vào giữa mọi Request và Response)
// Interceptor Request: can thiệp vào những request API
authorizedAxiosInstance.interceptors.request.use(
  (config) => {
    // Ky thuat cham spam click goi API
    interceptorLoadingElements(true)
    return config
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error)
  }
)
// Khoi tao mot cai promise cho viec goi api refresh token
let refreshTokenPromise = null
// Interceptor Response: can thiệp vào những response nhận về
authorizedAxiosInstance.interceptors.response.use(
  (response) => {
    // Ky thuat cham spam click goi API
    interceptorLoadingElements(false)
    return response
  },
  (error) => {
    // Ky thuat cham spam click goi API
    interceptorLoadingElements(false)

    // ** QTrong: xu ly rftk tu dong
    // TH1: Neu nhu BE nhan ma 401 thi goi api dang xuat luon  *//
    if (error.response?.status === 401) {
      axiosReduxStore.dispatch(logoutUserAPI(false))
    }
    // TH2: Neu nhu nhan 410 tu BE, thi se goi rftk de lam moi lai accessToken
    // Dau tien lay dc cac request API dang bi loi thong qua error.config
    const originalRequests = error.config
    if (error.response?.status === 410 && !originalRequests._retry) {
      // Gán thêm một giá trị _retry luôn = true trong khoảng thời gian chờ, đảm bảo việc refresh token này
      // chỉ luôn gọi 1 lần tại 1 thời điểm (nhìn lại điều kiện if ngay phía trên)

      originalRequests._retry = true
      // Kiểm tra xem nếu chưa có refreshTokenPromise thì thực hiện luôn việc gọi api refresh_token đồng thời
      // gán vào cho cái refreshTokenPromise
      if (!refreshTokenPromise) {
        refreshTokenPromise = refreshTokenAPI()
          .then((data) => {
            return data?.accessToken
          })
          .catch((_error) => {
            axiosReduxStore.dispatch(logoutUserAPI(false))
            return Promise.reject(_error)
          })
          .finally(() => {
            refreshTokenPromise = null
          })
      }
      // Cần return trường hợp refreshTokenPromise chạy thành công và xử lý thêm ở đây:
      // eslint-disable-next-line no-unused-vars
      return refreshTokenPromise.then((accessToken) => {
        /**
         * Bước 1: Đối với Trường hợp nếu dự án cần lưu accessToken vào localstorage hoặc đâu đó thì sẽ viết
         * thêm code xử lý ở đây.
         * Hiện tại ở đây không cần bước 1 này vì chúng ta đã đưa accessToken vào cookie (xử lý từ phía BE)
         * sau khi api refreshToken được gọi thành công.
         */

        // Bước 2: Bước Quan trọng: Return lại axios instance của chúng ta kết hợp các originalRequests để
        // gọi lại những api ban đầu bị lỗi
        return authorizedAxiosInstance(originalRequests)
      })
    }
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    // Mọi mã http status code nằm 200-299 sẽ là error và rơi vào đây
    let errorMessage = error?.message
    if (error.response?.data?.message) {
      errorMessage = error.response?.data?.message
    }
    // toast hien thi tat ca loi tren man hinh tru` loi 410 rftk
    if (error.response?.status !== 410) {
      toast.error(errorMessage)
    }
    return Promise.reject(error)
  }
)

export default authorizedAxiosInstance
