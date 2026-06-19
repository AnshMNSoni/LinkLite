import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically inject Bearer token from localStorage on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("linklite_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Catch 401 Unauthorized errors to clear stale/expired tokens automatically
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("linklite_token");
      localStorage.removeItem("linklite_user");
      // Force page reload to sync React state and reset to signed-out view
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
