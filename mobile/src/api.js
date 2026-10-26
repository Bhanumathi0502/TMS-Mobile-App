import axios from "axios";

// Android Emulator -> 10.0.2.2
// Physical phone -> replace with your PC IPv4, e.g. http://192.168.1.10:5000/api
export const API_BASE_URL = "http://192.168.43.208:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});

export function setAuthToken(token) {
  if (token) API.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete API.defaults.headers.common.Authorization;
}

export default API;
