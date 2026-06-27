// src/api/dashboard.js
// ====================================================
// Dashboard API — Stats, History, Streak, Profile
// ====================================================

import apiClient from './client'

// ড্যাশবোর্ড সামারি স্ট্যাটস
export const getDashboardStats = async () => {
  const response = await apiClient.get('/dashboard/stats/')
  return response.data
  // Returns: { total_xp, streak, completed_today, total_tasks, percent }
}

// ইতিহাস আনা (daily history log)
export const getHistory = async () => {
  const response = await apiClient.get('/dashboard/history/')
  return response.data
  // Returns: { "2026-06-01": { percent: 80, completed: [...ids] }, ... }
}

// মাসিক ক্যালেন্ডার ডেটা
export const getMonthlyData = async (year, month) => {
  const response = await apiClient.get(`/dashboard/monthly/?year=${year}&month=${month}`)
  return response.data
}

// বার্ষিক হিটম্যাপ ডেটা
export const getYearlyData = async (year) => {
  const response = await apiClient.get(`/dashboard/yearly/?year=${year}`)
  return response.data
}

// প্রোফাইল/সেটিংস আনা
export const getProfile = async () => {
  const response = await apiClient.get('/profile/')
  return response.data
}

// প্রোফাইল আপডেট করা
export const updateProfile = async (profileData) => {
  const response = await apiClient.patch('/profile/', profileData)
  return response.data
  // profileData: { userName, formulaTitle, formulaPhase, focusTime, avoidList, resources }
}
