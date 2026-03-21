import axios from "axios";
import { env } from "@/env";
import { STORAGE_KEYS, storage } from "@/shared/lib/storage";

export const api = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token de autenticação e tenant ID
api.interceptors.request.use((config) => {
  const token = storage.get(STORAGE_KEYS.TOKEN);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Adiciona X-Inn-Id se houver um tenant selecionado
  const selectedInnId = storage.get(STORAGE_KEYS.TENANT_ID);
  if (selectedInnId) {
    config.headers["X-Inn-Id"] = selectedInnId;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      storage.remove(STORAGE_KEYS.TOKEN);
      storage.remove(STORAGE_KEYS.TENANT_ID);

      try {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      } catch {
        try {
          window.location.replace("/login");
        } catch {}
      }
    }

    return Promise.reject({
      ...error,
      message:
        error?.response?.data?.detail || "Falha ao processar sua requisição",
    });
  },
);
