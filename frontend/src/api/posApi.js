import axiosInstance from "../utils/axios";

export const getCategoriesApi = () => {
  return axiosInstance.get("/staff/pos/categories");
};

export const getProductsApi = (params = {}) => {
  return axiosInstance.get("/staff/pos/products", { params });
};

export const searchProductsApi = (params = {}) => {
  return axiosInstance.get("/staff/pos/search", { params });
};

export const getPosProductsApi = (params = {}) => {
  return axiosInstance.get("/staff/pos/products", { params });
};

export const checkoutPosApi = (data) => {
  return axiosInstance.post("/staff/pos/checkout", data);
};

export const confirmQRPaymentApi = (paymentId) => {
  return axiosInstance.get(`/staff/pos/confirm-qr/${paymentId}`);
};



export const getPaymentStatusApi = (paymentId) => {
  return axiosInstance.get(`/staff/pos/payment-status/${paymentId}`);
};

export const checkPaymentStatusApi = (paymentId) => {
  return axiosInstance.get(`/staff/pos/payment-status/${paymentId}`);
};