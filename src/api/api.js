import axios from "axios";
import mainapi from "./mainapi"; // your base url file

const api = axios.create({
  baseURL: mainapi.USER_API
});

// 🔥 GLOBAL INTERCEPTOR
api.interceptors.request.use((config) => {

  // ✅ Add version headers automatically
  config.headers["X-Platform"] = "WEB";
  config.headers["X-App-Version"] = "1.0.0";

  // ✅ Add token automatically (if exists)
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

export default api;