import axiosInstance from "../utils/axios";

const staffinventoriesApi = {
  getAll() {
    return axiosInstance.get("/inventories");
  },
};

export default staffinventoriesApi;