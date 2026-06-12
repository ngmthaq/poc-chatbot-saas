export interface CoinSearchEntry {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank?: number | null;
}

export interface CoinSearchResponse {
  coins?: CoinSearchEntry[];
}

export interface CoinMarketData {
  price: number;
  change24h?: number;
  marketCap?: number;
  lastUpdatedAt?: number;
}

// Shape of CoinGecko's /simple/price response, keyed by coin id then by metric.
export type SimplePriceResponse = Record<string, Record<string, number>>;
