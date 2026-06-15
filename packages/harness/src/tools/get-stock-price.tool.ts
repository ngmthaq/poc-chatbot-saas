import { z } from 'zod';
import type {
  StockChartResponse,
  StockQuote,
  SymbolValidation,
  TwelveDataQuoteResponse,
  YahooSearchResponse,
} from '../types/get-stock-price';
import { dedent, fetchWithTimeout } from '../utils/index';
import { BaseTool } from './base/base-tool';

const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const YAHOO_SEARCH_URL = 'https://query1.finance.yahoo.com/v1/finance/search';
const TWELVE_DATA_QUOTE_URL = 'https://api.twelvedata.com/quote';

// Instrument types we treat as a valid, priceable "stock".
const TRADABLE_TYPES = new Set(['EQUITY', 'ETF', 'MUTUALFUND', 'INDEX']);

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);

const toNumber = (value: string | undefined): number | undefined => {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

// Confirm the ticker is a real, tradable instrument before fetching a price.
// Returns the resolved canonical symbol (or null) plus close-match suggestions.
const validateSymbol = async (ticker: string): Promise<SymbolValidation> => {
  const url = new URL(YAHOO_SEARCH_URL);
  url.searchParams.set('q', ticker);
  url.searchParams.set('quotesCount', '6');
  url.searchParams.set('newsCount', '0');

  const response = await fetchWithTimeout(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (!response.ok) {
    throw new Error(`Symbol search failed: ${response.status}`);
  }

  const data = (await response.json()) as YahooSearchResponse;
  const candidates = (data.quotes ?? []).filter(
    (q) => q.symbol && q.quoteType && TRADABLE_TYPES.has(q.quoteType),
  );

  const exact = candidates.find((q) => q.symbol?.toUpperCase() === ticker);
  const suggestions = candidates.slice(0, 3).map((q) => ({
    symbol: q.symbol as string,
    name: q.shortname ?? q.longname ?? (q.symbol as string),
    exchange: q.exchange,
  }));

  return { symbol: exact?.symbol ?? null, suggestions };
};

// Primary provider: Yahoo Finance (no API key required).
const fetchFromYahoo = async (ticker: string): Promise<StockQuote | null> => {
  const url = new URL(`${YAHOO_CHART_URL}/${encodeURIComponent(ticker)}`);
  url.searchParams.set('interval', '1d');
  url.searchParams.set('range', '1d');

  const response = await fetchWithTimeout(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (!response.ok) {
    throw new Error(`Yahoo quote request failed: ${response.status}`);
  }

  const data = (await response.json()) as StockChartResponse;
  const meta = data.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;
  if (!meta || price === undefined) {
    return null;
  }

  return {
    symbol: meta.symbol,
    name: meta.longName ?? meta.shortName ?? ticker,
    currency: meta.currency ?? 'USD',
    price,
    previousClose: meta.chartPreviousClose,
    dayHigh: meta.regularMarketDayHigh,
    dayLow: meta.regularMarketDayLow,
  };
};

// Fallback provider: Twelve Data (used only when TWELVE_DATA_API_KEY is set).
const fetchFromTwelveData = async (
  ticker: string,
): Promise<StockQuote | null> => {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) return null;

  const url = new URL(TWELVE_DATA_QUOTE_URL);
  url.searchParams.set('symbol', ticker);
  url.searchParams.set('apikey', apiKey);

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`Twelve Data quote request failed: ${response.status}`);
  }

  const data = (await response.json()) as TwelveDataQuoteResponse;
  const price = toNumber(data.close);
  if (data.status === 'error' || price === undefined) {
    return null;
  }

  return {
    symbol: data.symbol ?? ticker,
    name: data.name ?? ticker,
    currency: data.currency ?? 'USD',
    price,
    previousClose: toNumber(data.previous_close),
    dayHigh: toNumber(data.high),
    dayLow: toNumber(data.low),
  };
};

const formatQuote = (quote: StockQuote): string => {
  const lines = [
    `${quote.name} (${quote.symbol}) price: ${formatNumber(quote.price)} ${quote.currency}.`,
  ];

  if (quote.previousClose !== undefined && quote.previousClose !== 0) {
    const change = quote.price - quote.previousClose;
    const changePct = (change / quote.previousClose) * 100;
    const sign = change >= 0 ? '+' : '';
    lines.push(
      `Change since previous close: ${sign}${formatNumber(change)} (${sign}${changePct.toFixed(2)}%).`,
    );
  }

  if (quote.dayLow !== undefined && quote.dayHigh !== undefined) {
    lines.push(
      `Day range: ${formatNumber(quote.dayLow)} - ${formatNumber(quote.dayHigh)} ${quote.currency}.`,
    );
  }

  return lines.join('\n');
};

const getStockPriceSchema = z.object({
  symbol: z
    .string()
    .describe('The stock ticker symbol to look up (e.g. "AAPL", "TSLA")'),
});

export class GetStockPriceTool extends BaseTool<typeof getStockPriceSchema> {
  public readonly name = 'getStockPrice';

  public readonly description = dedent`
        Use this tool to look up the current market price of a publicly traded
        stock by its ticker symbol (e.g. "AAPL", "TSLA", "MSFT").
        If the symbol is not found, the tool will indicate this and you must
        tell the user the stock price is unavailable.
    `;

  public readonly schema = getStockPriceSchema;

  public async execute({
    symbol,
  }: z.infer<typeof getStockPriceSchema>): Promise<string> {
    const ticker = symbol.trim().toUpperCase();
    console.log(`Looking up stock price for ${ticker}`);

    // Validate the symbol exists before fetching a price. Best-effort: if the
    // search endpoint itself errors, fall through to the price providers.
    try {
      const validation = await validateSymbol(ticker);
      if (!validation.symbol) {
        if (validation.suggestions.length > 0) {
          const hints = validation.suggestions
            .map((s) => `${s.symbol} (${s.name})`)
            .join(', ');
          return `"${ticker}" is not a recognized stock symbol. Did you mean: ${hints}?`;
        }
        return `"${ticker}" is not a recognized stock symbol.`;
      }
    } catch (error) {
      console.error(
        `Symbol validation failed for ${ticker}, proceeding anyway:`,
        error,
      );
    }

    // Try Yahoo first; fall back to Twelve Data if it fails or returns nothing.
    let quote: StockQuote | null = null;
    try {
      quote = await fetchFromYahoo(ticker);
    } catch (error) {
      console.error(`Yahoo lookup failed for ${ticker}:`, error);
    }

    if (!quote) {
      try {
        quote = await fetchFromTwelveData(ticker);
      } catch (error) {
        console.error(`Twelve Data lookup failed for ${ticker}:`, error);
      }
    }

    if (!quote) {
      return `The stock price for "${ticker}" is unavailable. The symbol may be invalid or the data providers may be temporarily unreachable.`;
    }

    return formatQuote(quote);
  }
}
