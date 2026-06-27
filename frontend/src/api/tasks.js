// src/api/tasks.js
// ====================================================
// Tasks API — Task CRUD + Complete/Uncomplete
// ====================================================

import apiClient from './client'

// সব টাস্ক আনা
export const getTasks = async () => {
  const response = await apiClient.get('/tasks/')
  return response.data
}

// নতুন টাস্ক তৈরি করা
export const createTask = async (taskData) => {
  const response = await apiClient.post('/tasks/', taskData)
  return response.data
  // taskData: { text, cat, xp }
}

// টাস্ক আপডেট করা
export const updateTask = async (id, taskData) => {
  const response = await apiClient.patch(`/tasks/${id}/`, taskData)
  return response.data
}

// টাস্ক ডিলিট করা
export const deleteTask = async (id) => {
  await apiClient.delete(`/tasks/${id}/`)
}

// টাস্ক সম্পন্ন চিহ্নিত করা (toggle)
export const toggleTaskComplete = async (id) => {
  const response = await apiClient.post(`/tasks/${id}/toggle/`)
  return response.data
  // Returns: { completed: true/false, xp_earned: 20 }
}

// আজকের সব টাস্ক রিসেট করা (নতুন দিন শুরু)
export const resetDailyTasks = async () => {
  const response = await apiClient.post('/tasks/reset/')
  return response.data
}

// সব টাস্ক একসাথে সম্পন্ন করা
export const markAllComplete = async () => {
  const response = await apiClient.post('/tasks/mark-all/')
  return response.data
}
