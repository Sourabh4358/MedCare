// src/api/axiosInstance.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api", // handled by Vite proxy
});

export default api;
