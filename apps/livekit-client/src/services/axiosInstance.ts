import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env['VITE_API_BASE_URL'];
if (!BASE_URL) throw new Error('VITE_API_BASE_URL is not defined');

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error: unknown) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => Promise.reject(error),
);
