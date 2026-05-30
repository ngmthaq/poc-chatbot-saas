import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const BASE_URL: string = import.meta.env['VITE_API_BASE_URL'];

const axiosInstance = axios.create({
  baseURL: BASE_URL,
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

export { axiosInstance };
