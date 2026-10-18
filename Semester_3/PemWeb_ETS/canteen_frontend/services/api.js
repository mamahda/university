import axios from "axios";

const api = axios.create({
  baseURL: "http://23.100.91.246/api",
});

export default api;