import api from "../utils/axios";
const API = import.meta.env.VITE_API_URL;

export const loginApi = (data) => {
  return api.post(`${API}/users/login`, data);
};

export const registerApi = (data) => {
  return api.post(`${API}/users/register`, data);
};

export const getMeApi = () => {
  return api.get(`${API}/users/profile`);
};