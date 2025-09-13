import axios from 'axios';

// The baseURL should point to the backend service.
// When running locally with `npm run dev`, it's localhost.
// Inside Docker, containers can't talk to `localhost`, but this is fine
// because Nginx serves the static files and the browser makes the API calls
// from the user's machine to the mapped port.
const api = axios.create({
  baseURL: 'http://localhost:8000',
});

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