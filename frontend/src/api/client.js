// src/api/client.js
// ====================================================
// Central Axios Instance — সব API call এখান দিয়ে যাবে
// ====================================================

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

// Request Interceptor — JWT token automatically attach করবে
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('life_engine_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor — 401 হলে logout করবে
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('life_engine_token')
      localStorage.removeItem('life_engine_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
