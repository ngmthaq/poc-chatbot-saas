import { z } from 'zod';
import type { ExchangeRateResponse } from '../types/convert-currency';
import { dedent } from '../utils/index';
import { BaseTool } from './base/base-tool';

const EXCHANGE_RATE_URL = 'https://open.er-api.com/v6/latest';

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(value);

const convertCurrencySchema = z.object({
  amount: z
    .number()
    .default(1)
    .describe('The amount of money to convert (must be greater than 0)'),
  from: z
    .string()
    .length(3)
    .describe('The 3-letter ISO code of the source currency (e.g. "USD")'),
  to: z
    .string()
    .length(3)
    .describe('The 3-letter ISO code of the target currency (e.g. "EUR")'),
});

export class ConvertCurrencyTool extends BaseTool<
  typeof convertCurrencySchema
> {
  public readonly name = 'convertCurrency';

  public readonly description = dedent`
        Use this tool to convert an amount of money from one currency to another
        using current exchange rates (e.g. convert 100 USD to EUR).
        Currencies are given as 3-letter ISO codes (e.g. "USD", "EUR", "VND").
        If a currency is not supported, the tool will indicate this and you must
        tell the user the conversion is unavailable.
    `;

  public readonly schema = convertCurrencySchema;

  public async execute({
    amount,
    from,
    to,
  }: z.infer<typeof convertCurrencySchema>): Promise<string> {
    if (amount <= 0) {
      return 'The amount to convert must be greater than 0.';
    }

    const fromCode = from.trim().toUpperCase();
    const toCode = to.trim().toUpperCase();
    console.log(`Converting ${amount} ${fromCode} to ${toCode}`);

    try {
      const response = await fetch(
        `${EXCHANGE_RATE_URL}/${encodeURIComponent(fromCode)}`,
      );
      if (!response.ok) {
        throw new Error(`Exchange rate request failed: ${response.status}`);
      }

      const data = (await response.json()) as ExchangeRateResponse;
      if (data.result !== 'success' || !data.rates) {
        return `The conversion is unavailable because "${fromCode}" is not a supported currency.`;
      }

      const rate = data.rates[toCode];
      if (rate === undefined) {
        return `The conversion is unavailable because "${toCode}" is not a supported currency.`;
      }

      const converted = amount * rate;

      return dedent`
        ${formatNumber(amount)} ${fromCode} = ${formatNumber(converted)} ${toCode}.
        Exchange rate: 1 ${fromCode} = ${formatNumber(rate)} ${toCode}.
        Rates last updated: ${data.time_last_update_utc ?? 'unknown'}.
      `;
    } catch (error) {
      console.error(`Failed to convert ${fromCode} to ${toCode}:`, error);
      return `The conversion from ${fromCode} to ${toCode} is unavailable due to a service error.`;
    }
  }
}
