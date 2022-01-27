// импортируем axios
import axios from 'axios';

// создаём новый экземпляр axios с /api в качестве базового URL
const axiosInstance = axios.create({
  baseURL: '/api/'
});

// добавляем централизованную обработку ошибок при получении ответа от сервера
axiosInstance.interceptors.response.use(res => res, e => {
  const defaultMessage = 'Возникла ошибка при выполнении запроса к серверу';
  axiosInstance.$notifier.error(
    e?.response?.data?.error?.message || defaultMessage
  );
  return Promise.reject(e);
});

export default axiosInstance;
