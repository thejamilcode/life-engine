// src/api/auth.js
// ====================================================
// Authentication API — Login, Register, Logout
// ====================================================

import apiClient from './client'

// ব্যবহারকারী লগইন করা
export const loginUser = async (username, password) => {
  const response = await apiClient.post('/auth/login/', { username, password })
  return response.data
  // Returns: { access: "jwt_token", refresh: "refresh_token", user: {...} }
}

// নতুন ব্যবহারকারী রেজিস্ট্রেশন
export const registerUser = async (userData) => {
  const response = await apiClient.post('/auth/register/', userData)
  return response.data
  // userData: { username, email, password, name }
}

// টোকেন রিফ্রেশ
export const refreshToken = async (refresh) => {
  const response = await apiClient.post('/auth/token/refresh/', { refresh })
  return response.data
}

// বর্তমান ব্যবহারকারীর তথ্য আনা
export const getMe = async () => {
  const response = await apiClient.get('/auth/me/')
  return response.data
}
