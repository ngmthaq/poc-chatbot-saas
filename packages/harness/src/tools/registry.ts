import type { BaseTool } from './base/base-tool';
import { ConvertCurrencyTool } from './convert-currency.tool';
import { GetCoinPriceTool } from './get-coin-price.tool';
import { GetGoldPriceTool } from './get-gold-price.tool';
import { GetStockPriceTool } from './get-stock-price.tool';
import { GetWeatherTool } from './get-weather.tool';
import { WebSearchTool } from './web-search.tool';

/**
 * The full set of framework-agnostic tool instances exposed by the harness.
 *
 * Adapters (`./livekit`, `./langchain`) consume this registry to produce
 * framework-specific tool collections.
 */
export const toolRegistry: BaseTool[] = [
  new GetWeatherTool(),
  new GetCoinPriceTool(),
  new GetGoldPriceTool(),
  new GetStockPriceTool(),
  new ConvertCurrencyTool(),
  new WebSearchTool(),
];
