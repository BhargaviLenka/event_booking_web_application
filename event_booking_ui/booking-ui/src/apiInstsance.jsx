import axios from 'axios';
import Cookies from 'js-cookie';  

const BASE_URL = 'http://127.0.0.1:8000';

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
    const csrfToken = Cookies.get('csrftoken');
   if (csrfToken && ['post', 'put', 'delete'].includes(config.method.toLowerCase())) {
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
