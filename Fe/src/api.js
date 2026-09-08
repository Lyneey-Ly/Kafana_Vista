import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api', //
  headers: {
    'Accept': 'application/json', //[cite: 4]
    'Content-Type': 'application/json', //[cite: 4]
  },
});

// Interceptor untuk menyisipkan Token Sanctum
API.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token'); //[cite: 4]
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; //[cite: 4]
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API; //[cite: 4]