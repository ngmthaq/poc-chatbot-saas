import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { loadConfig } from './env';

const BASE_URL: string = loadConfig().apiBaseUrl;

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
