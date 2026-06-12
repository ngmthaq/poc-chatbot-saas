import { convertCurrency } from './convertCurrency';
import { getCoinPrice } from './getCoinPrice';
import { getGoldPrice } from './getGoldPrice';
import { getStockPrice } from './getStockPrice';
import { getWeather } from './getWeather';
import { searchBranchInformation } from './searchBranchInformation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const tools: Record<string, any> = {
  getWeather,
  getCoinPrice,
  getGoldPrice,
  getStockPrice,
  convertCurrency,
  searchBranchInformation,
} as const;
