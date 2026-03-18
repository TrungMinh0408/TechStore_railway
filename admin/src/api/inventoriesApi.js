import axios from "./axios";

const inventoriesApi = {
  getAll(branchId) {
    const params = {};

    if (branchId) {
      params.branchId = branchId;
    }

    return axios.get("/admin/inventories", { params });
  },
};

export default inventoriesApi;