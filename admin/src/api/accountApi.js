import axios from "./axios";

const accountApi = {
  getAll() {
    return axios.get("/admin/accounts");
  },

  getById(id) {
    return axios.get(`/admin/accounts/${id}`);
  },

  /**
   * @param {FormData} data
   */
  create(data) {
    return axios.post("/admin/accounts", data);
  },

  /**
   * @param {string} id
   * @param {FormData} data
   */
  update(id, data) {
    return axios.put(`/admin/accounts/${id}`, data);
  },

  delete(id) {
    return axios.delete(`/admin/accounts/${id}`);
  },
};

export default accountApi;
