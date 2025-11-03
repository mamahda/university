import axios from "axios";

const api = axios.create({
  baseURL: "https://api.farelfebryan.my.id/api",
});

export default api;