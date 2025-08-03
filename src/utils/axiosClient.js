import axios from 'axios';
import { getToken, removeToken } from '../helper';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// Request Interceptor — adds token to headers
axiosClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor — handles global errors (e.g. token expiry)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response

      // Handle unauthorized globally
      if (status === 401) {
        removeToken();
        // window.location.href = '/login'
      }

      // Handle other global errors
      // if (status === 500) alert("Something went wrong on the server.")
    }

    return Promise.reject(error)
  }
)
