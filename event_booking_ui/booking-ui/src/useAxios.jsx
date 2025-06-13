import { useState } from 'react';
import axios from 'axios';

// ✅ Use the environment variable
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ Create a reusable axios instance
const apiInstance = axios.create({
  baseURL: BASE_URL,
});

const useAxios = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (config) => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Use the apiInstance instead of raw axios
      const res = await apiInstance(config);
      setResponse(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return [response, error, loading, fetchData];
};

export default useAxios;
