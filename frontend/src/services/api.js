import axios from 'axios';

// This is the key change. We are now using an Environment Variable.
// In local development (npm run dev), Vite uses VITE_API_BASE_URL from a .env file.
// In production (on Vercel), it uses the VITE_API_BASE_URL we will set in the Vercel dashboard.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

console.log(`API is configured to use: ${API_BASE_URL}`); // A helpful message for debugging.

// Interceptor to add the JWT token to every request if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;