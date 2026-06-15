import { z } from 'zod';
import type {
  CoinSearchResponse,
  SimplePriceResponse,
} from '../types/get-coin-price';
import { dedent } from '../utils/index';
import { BaseTool } from './base/base-tool';

const SEARCH_URL = 'https://api.coingecko.com/api/v3/search';
const SIMPLE_PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price';

// CoinGecko /simple/supported_vs_currencies (63 fiat + crypto codes).
const SUPPORTED_CURRENCIES = [
  'aed',
  'ars',
  'aud',
  'bch',
  'bdt',
  'bhd',
  'bits',
  'bmd',
  'bnb',
  'brl',
  'btc',
  'cad',
  'chf',
  'clp',
  'cny',
  'czk',
  'dkk',
  'dot',
  'eos',
  'eth',
  'eur',
  'gbp',
  'gel',
  'hkd',
  'huf',
  'idr',
  'ils',
  'inr',
  'jpy',
  'krw',
  'kwd',
  'link',
  'lkr',
  'ltc',
  'mmk',
  'mxn',
  'myr',
  'ngn',
  'nok',
  'nzd',
  'php',
  'pkr',
  'pln',
  'rub',
  'sar',
  'sats',
  'sek',
  'sgd',
  'sol',
  'thb',
  'try',
  'twd',
  'uah',
  'usd',
  'vef',
  'vnd',
  'xag',
  'xau',
  'xdr',
  'xlm',
  'xrp',
  'yfi',
  'zar',
] as const;

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 }).format(value);

const getCoinPriceSchema = z.object({
  coin: z
    .string()
    .describe('The cryptocurrency name or symbol (e.g. "bitcoin", "BTC")'),
  currency: z
    .enum(SUPPORTED_CURRENCIES)
    .default('usd')
    .describe('The fiat or crypto currency to price the coin in'),
});

export class GetCoinPriceTool extends BaseTool<typeof getCoinPriceSchema> {
  public readonly name = 'getCoinPrice';

  public readonly description = dedent`
        Use this tool to look up the current market price of a cryptocurrency.
        Accepts a coin name or symbol (e.g. "bitcoin", "BTC", "ethereum").
        If the coin is not found, the tool will indicate this and you must tell
        the user the price is unavailable.
    `;

  public readonly schema = getCoinPriceSchema;

  public async execute({
    coin,
    currency,
  }: z.infer<typeof getCoinPriceSchema>): Promise<string> {
    console.log(`Looking up price for ${coin} in ${currency}`);

    try {
      // 1. Resolve the coin name/symbol to a CoinGecko coin id.
      const searchUrl = new URL(SEARCH_URL);
      searchUrl.searchParams.set('query', coin);

      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) {
        throw new Error(`Search request failed: ${searchResponse.status}`);
      }

      const search = (await searchResponse.json()) as CoinSearchResponse;
      const query = coin.toLowerCase();
      const match =
        search.coins?.find((c) => c.symbol.toLowerCase() === query) ??
        search.coins?.[0];
      if (!match) {
        return `The price for "${coin}" is unavailable because the coin could not be found.`;
      }

      // 2. Fetch the current price and 24h change for that coin id.
      const priceUrl = new URL(SIMPLE_PRICE_URL);
      priceUrl.searchParams.set('ids', match.id);
      priceUrl.searchParams.set('vs_currencies', currency);
      priceUrl.searchParams.set('include_24hr_change', 'true');
      priceUrl.searchParams.set('include_market_cap', 'true');

      const priceResponse = await fetch(priceUrl);
      if (!priceResponse.ok) {
        throw new Error(`Price request failed: ${priceResponse.status}`);
      }

      const data = (await priceResponse.json()) as SimplePriceResponse;
      const entry = data[match.id];
      const price = entry?.[currency];
      if (!entry || price === undefined) {
        return `The price for ${match.name} in ${currency.toUpperCase()} is unavailable right now.`;
      }

      const change24h = entry[`${currency}_24h_change`];
      const marketCap = entry[`${currency}_market_cap`];
      const upper = currency.toUpperCase();

      const lines = [
        `${match.name} (${match.symbol.toUpperCase()}) price: ${formatNumber(price)} ${upper}.`,
      ];
      if (change24h !== undefined) {
        lines.push(`24h change: ${change24h.toFixed(2)}%.`);
      }
      if (marketCap !== undefined) {
        lines.push(`Market cap: ${formatNumber(marketCap)} ${upper}.`);
      }

      return lines.join('\n');
    } catch (error) {
      console.error(`Failed to look up price for ${coin}:`, error);
      return `The price for "${coin}" is unavailable due to a service error.`;
    }
  }
}
