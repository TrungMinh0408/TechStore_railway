import axiosInstance from "../utils/axios";

export const createVNPay = async (data) => {
    return axiosInstance.post("/staff/vnpay/create", data);
};