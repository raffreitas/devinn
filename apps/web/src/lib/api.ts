import axios from 'axios';
import { env } from './env';

export const api = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true, // Para enviar cookies automaticamente
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login se não autorizado
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
