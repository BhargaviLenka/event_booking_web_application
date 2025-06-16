import axios from 'axios';
import Cookies from 'js-cookie';  // Make sure you've installed this with: npm install js-cookie

const BASE_URL = 'http://localhost:8000';

const getTokenFromCookies = () => {
  const name = 'access_token=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
};

const apiInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  xsrfHeaderName: 'X-CSRFToken',
  xsrfCookieName: 'csrftoken',
  headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
  }
});

apiInstance.interceptors.request.use(
  config => {
    const token = getTokenFromCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const csrfToken = Cookies.get('csrftoken');
    if (csrfToken && ['POST', 'PUT', 'DELETE'].includes(config.method)) {
      config.headers['X-CSRFToken'] = csrfToken;
    }

    return config;
  },
  error => Promise.reject(error)
);


apiInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiInstance;
