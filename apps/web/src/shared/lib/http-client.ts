import axios from "axios";
import { env } from "@/env";

export const api = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Adiciona X-Inn-Id se for SuperAdmin
  const selectedInnId = localStorage.getItem('selected_inn_id');
  if (selectedInnId) {
    config.headers['X-Inn-Id'] = selectedInnId;
  }

  return config;
});
