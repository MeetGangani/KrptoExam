import axios from 'axios';

const apiUrl = import.meta.env.VITE_BACKEND_URI;

const axiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    
  },
  timeout: 30000, // 30 seconds
});

// Add request interceptor to handle errors
axiosInstance.interceptors.request.use(
  (config) => {
    // You can modify config here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error - maybe redirect to login
      console.error('Unauthorized access, please login again');
      // You could dispatch a logout action here or redirect
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 