import { getCoinPrice } from './getCoinPrice';
import { getGoldPrice } from './getGoldPrice';
import { getStockPrice } from './getStockPrice';
import { getWeather } from './getWeather';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const tools: Record<string, any> = {
  getWeather,
  getCoinPrice,
  getGoldPrice,
  getStockPrice,
} as const;
