// src/hooks/apiInstance.js

import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const apiInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

apiInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiInstance;
