export interface StockQuoteMeta {
  currency?: string;
  symbol: string;
  longName?: string;
  shortName?: string;
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
}

export interface StockChartResult {
  meta?: StockQuoteMeta;
}

export interface StockChartResponse {
  chart?: {
    result?: StockChartResult[];
    error?: { code: string; description: string } | null;
  };
}

// Twelve Data /quote response (numeric fields arrive as strings).
export interface TwelveDataQuoteResponse {
  symbol?: string;
  name?: string;
  currency?: string;
  close?: string;
  previous_close?: string;
  high?: string;
  low?: string;
  status?: string;
  code?: number;
  message?: string;
}

// Yahoo Finance /v1/finance/search response (symbol validation + suggestions).
export interface YahooSearchQuote {
  symbol?: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
  exchange?: string;
}

export interface YahooSearchResponse {
  quotes?: YahooSearchQuote[];
}

export interface SymbolSuggestion {
  symbol: string;
  name: string;
  exchange?: string | undefined;
}

// Result of validating a ticker: resolved canonical symbol (or null) + suggestions.
export interface SymbolValidation {
  symbol: string | null;
  suggestions: SymbolSuggestion[];
}

// Normalized quote shared by every provider.
export interface StockQuote {
  symbol: string;
  name: string;
  currency: string;
  price: number;
  previousClose?: number | undefined;
  dayHigh?: number | undefined;
  dayLow?: number | undefined;
}
