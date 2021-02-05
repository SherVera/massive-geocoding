import axios from 'axios'
import env from '../env'
const axiosInstance = axios.create({
  baseURL: env.apiUrl
})

export default async ({ store, Vue }) => {
  // Vue.prototype.$axios = axios
  Vue.prototype.$api = axiosInstance

  axiosInstance.interceptors.response.use(function (response) {
    // Todo bien con la respuesta
    return response.data
  })
}
export { axiosInstance }
