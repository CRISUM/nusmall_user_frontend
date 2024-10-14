// import axios from '@/utils/axios'

// export const login = (data) => {
//   return axios.post('/api/login', data)
// }

// export const register = (data) => {
//   return axios.post('/api/register', data)
// }

// export const getAllUsers = () => {
//   return axios.get('/api/users')
// }

// export const getUserById = (id) => {
//   return axios.get(`/api/users/${id}`)
// }

// export const createUser = (data) => {
//   return axios.post('/api/users', data)
// }

// export const updateUser = (id, data) => {
//   return axios.put(`/api/users/${id}`, data)
// }

// export const deleteUser = (id) => {
//   return axios.delete(`/api/users/${id}`)
// }

// src/service/user.js
import * as mockService from '@/utils/mockService';

export const login = mockService.login;
export const register = mockService.register;
export const getAllUsers = mockService.getAllUsers;
export const getUserById = mockService.getUserById;
export const createUser = mockService.createUser;
export const updateUser = mockService.updateUser;
export const deleteUser = mockService.deleteUser;