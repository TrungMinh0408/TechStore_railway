import axios from "./axios";

const activityApi = {

  getAll: () => {
    console.group(" [API] GET /admin/audit-logs");
    console.groupEnd();
    return axios.get("/admin/audit-logs");
  },

  getWithFilter: (params) => {
    console.group(" [API] GET /admin/audit-logs (Filtered)");
    console.log("Query Params:", params);
    console.groupEnd();
    return axios.get("/admin/audit-logs", { params });
  },

  getDetails: (id) => {
    console.group(` [API] GET /admin/audit-logs/${id}`);
    console.groupEnd();
    return axios.get(`/admin/audit-logs/${id}`);
  }

};

export default activityApi;