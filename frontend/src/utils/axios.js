import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://techstorerailway-production.up.railway.app",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.MODE === "development") {
      console.log(
        `[Request] ${config.method?.toUpperCase()} -> ${config.baseURL}${config.url}`
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.MODE === "development") {
      console.log(
        `[Response] ${response.status} <- ${response.config.baseURL}${response.config.url}`
      );
    }

    return response;
  },

  (error) => {
    if (import.meta.env.MODE === "development") {
      console.error(
        `[Error] ${error.response?.status} <- ${error.config?.baseURL}${error.config?.url}`
      );
    }

    const status = error.response?.status;
    const url = error.config?.url || "";

    /* =========================
       AUTH ROUTES (FIXED)
    ========================= */
    const authRoutes = [
      "/users/login",
      "/users/register",
      "/users/forgot-password",
      "/users/reset-password",
    ];

    const isAuthRequest = authRoutes.some((route) =>
      url.startsWith(route)
    );

    /* =========================
       TOKEN HẾT HẠN
    ========================= */
    if (status === 401 && !isAuthRequest) {
      console.warn("Token expired → logging out");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    /* =========================
       KHÔNG CÓ QUYỀN
    ========================= */
    if (status === 403) {
      window.location.href = "/NotFound";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;