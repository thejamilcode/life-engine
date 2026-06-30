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

// Request Interceptor — JWT token automatically attach করবে (পাবলিক রাউট ছাড়া)
apiClient.interceptors.request.use(
  (config) => {
    // লগইন, রেজিস্টার, OTP ইত্যাদি পাবলিক রিকোয়েস্টে টোকেন পাঠানোর দরকার নেই
    const isPublicRoute = config.url && (
      config.url.includes('/auth/login/') ||
      config.url.includes('/auth/register/') ||
      config.url.includes('/auth/send-otp/') ||
      config.url.includes('/auth/verify-otp/') ||
      config.url.includes('/auth/forgot-password/') ||
      config.url.includes('/auth/reset-password/')
    )

    if (!isPublicRoute) {
      const token = localStorage.getItem('life_engine_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor — 401 হলে logout করবে
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPublicRoute = error.config?.url && (
      error.config.url.includes('/auth/login/') ||
      error.config.url.includes('/auth/register/') ||
      error.config.url.includes('/auth/send-otp/') ||
      error.config.url.includes('/auth/verify-otp/') ||
      error.config.url.includes('/auth/forgot-password/') ||
      error.config.url.includes('/auth/reset-password/')
    )

    // পাবলিক রাউটে 401 হলে লগইনে রিডাইরেক্ট করার প্রয়োজন নেই
    if (error.response?.status === 401 && !isPublicRoute) {
      localStorage.removeItem('life_engine_token')
      localStorage.removeItem('life_engine_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
