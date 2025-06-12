
import { useState } from 'react';
import axios from 'axios';

// const service = new HttpAxiosService(HRMS_BASE_URL);


const useAxios = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (config) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios(config);
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
