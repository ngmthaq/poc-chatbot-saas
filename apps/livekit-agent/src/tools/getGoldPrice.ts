import { dedent, llm } from '@livekit/agents';
import z from 'zod';
import type { MetalPriceResponse } from '../types/get-gold-price';

const METAL_PRICE_URL = 'https://api.gold-api.com/price';

// Map the user-facing metal name to its gold-api.com symbol.
const METAL_SYMBOLS = {
  gold: 'XAU',
  silver: 'XAG',
  platinum: 'XPT',
  palladium: 'XPD',
} as const;

type Metal = keyof typeof METAL_SYMBOLS;

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);

export const getGoldPrice = llm.tool({
  description: dedent`
        Use this tool to look up the current spot price of a precious metal
        (gold, silver, platinum, or palladium) in US dollars per troy ounce.
        If the price cannot be retrieved, the tool will indicate this and you
        must tell the user the price is unavailable.
    `,
  parameters: z.object({
    metal: z
      .enum(Object.keys(METAL_SYMBOLS) as [Metal, ...Metal[]])
      .default('gold')
      .describe('The precious metal to look up the spot price for'),
  }),
  execute: async ({ metal }) => {
    console.log(`Looking up spot price for ${metal}`);

    try {
      const symbol = METAL_SYMBOLS[metal];
      const response = await fetch(`${METAL_PRICE_URL}/${symbol}`);
      if (!response.ok) {
        throw new Error(`Price request failed: ${response.status}`);
      }

      const data = (await response.json()) as MetalPriceResponse;
      if (typeof data.price !== 'number') {
        return `The price for ${metal} is unavailable right now.`;
      }

      return dedent`
        Current ${data.name} spot price: $${formatNumber(data.price)} ${data.currency} per troy ounce.
        Last updated: ${data.updatedAtReadable ?? data.updatedAt}.
      `;
    } catch (error) {
      console.error(`Failed to look up spot price for ${metal}:`, error);
      return `The price for ${metal} is unavailable due to a service error.`;
    }
  },
});
