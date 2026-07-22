import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 500;
    const message =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      `Erro ${status}`;
    return new ApiError(message, status);
  }
  return new ApiError("Erro desconhecido", 500);
}

export const api = {
  get: <T>(endpoint: string) =>
    axiosInstance.get<T>(endpoint).then((res) => res.data),
  post: <T>(endpoint: string, data: unknown) =>
    axiosInstance.post<T>(endpoint, data).then((res) => res.data),
  put: <T>(endpoint: string, data: unknown) =>
    axiosInstance.put<T>(endpoint, data).then((res) => res.data),
  delete: <T>(endpoint: string) =>
    axiosInstance.delete<T>(endpoint).then((res) => res.data),
};
