import axiosInstance from "../utils/axios";
const API = import.meta.env.VITE_API_URL;

export const loginApi = (data) => {
  console.log("LOGIN DATA SEND:", data);
  return axiosInstance.post(`/users/login`, data);
};

export const getProfileApi = () => {
  return axiosInstance.get(`${API}/users/profile`);
};

export const forgotPasswordApi = (data) => {
  return axiosInstance.post(`${API}/users/forgot-password`, data);
};

export const resetPasswordApi = (token, data) => {
  return axiosInstance.post(`/users/reset-password/${token}`, data);
};