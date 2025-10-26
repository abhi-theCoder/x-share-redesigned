import axios from "axios";

const instance = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL,
  baseURL: "http://localhost:5001/",
  headers: {
    'Content-Type': 'application/json' 
  }
});

export default instance;