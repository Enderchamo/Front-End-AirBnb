import axios from 'axios';

// Creamos una instancia base
const api = axios.create({
  baseURL: 'http://localhost:5085/api',
});

// "Interceptor": Antes de que salga cualquier petición, le pega el Token si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;