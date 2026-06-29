// src/api/auth.js
// ====================================================
// Authentication API — Login, Register, OTP, Logout
// ====================================================

import apiClient from './client'

// ব্যবহারকারী লগইন করা
export const loginUser = async (username, password) => {
  const response = await apiClient.post('/auth/login/', { username, password })
  return response.data
  // Returns: { access: "jwt_token", refresh: "refresh_token", user: {...} }
}

// নতুন ব্যবহারকারী রেজিস্ট্রেশন (legacy — no OTP)
export const registerUser = async (userData) => {
  const response = await apiClient.post('/auth/register/', userData)
  return response.data
  // userData: { username, email, password, name }
}

// Step 1 — OTP পাঠানো (Gmail SMTP)
export const sendOTP = async (userData) => {
  const response = await apiClient.post('/auth/send-otp/', userData)
  return response.data
  // userData: { username, email, name, password }
  // Returns: { message: "...", email: "..." }
}

// Step 2 — OTP যাচাই এবং অ্যাকাউন্ট তৈরি
export const verifyOTP = async (email, otp_code) => {
  const response = await apiClient.post('/auth/verify-otp/', { email, otp_code })
  return response.data
  // Returns: { access, refresh, user, message }
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
