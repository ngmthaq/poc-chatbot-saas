import { z } from 'zod';
import type {
  DuckDuckGoResponse,
  TavilyResponse,
  WebSearchResult,
  WikipediaSearchResponse,
  WikipediaSummaryResponse,
} from '../types/web-search';
import { dedent, fetchWithTimeout } from '../utils/index';
import { BaseTool } from './base/base-tool';

const TAVILY_SEARCH_URL = 'https://api.tavily.com/search';
const DUCKDUCKGO_URL = 'https://api.duckduckgo.com/';
const WIKIPEDIA_SEARCH_URL =
  'https://en.wikipedia.org/w/rest.php/v1/search/page';
const WIKIPEDIA_SUMMARY_URL =
  'https://en.wikipedia.org/api/rest_v1/page/summary';
const GOOGLE_SEARCH_URL = 'https://www.google.com/search';

// Most public search APIs ask clients to identify themselves.
const REQUEST_HEADERS = { 'User-Agent': 'livekit-agent/1.0 (call-center)' };

// Build a Google search URL to fall back on when no provider has data.
const buildFallbackSearchUrl = (query: string): string => {
  const url = new URL(GOOGLE_SEARCH_URL);
  url.searchParams.set('q', query);
  return url.toString();
};

// Optional best-quality provider: Tavily (LLM-optimized). Used only when
// TAVILY_API_KEY is set; otherwise skipped silently so the tool works keyless.
const fetchFromTavily = async (
  query: string,
): Promise<WebSearchResult | null> => {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;

  const response = await fetchWithTimeout(TAVILY_SEARCH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: 5,
      include_answer: true,
    }),
  });
  if (!response.ok) {
    throw new Error(`Tavily request failed: ${response.status}`);
  }

  const data = (await response.json()) as TavilyResponse;

  // Prefer the synthesized answer; otherwise fall back to the top result.
  if (data.answer) {
    return { provider: 'Tavily', title: query, snippet: data.answer };
  }

  const top = data.results?.[0];
  if (!top) return null;

  return {
    provider: 'Tavily',
    title: top.title,
    snippet: top.content,
    sourceUrl: top.url,
  };
};

// Keyless layer: DuckDuckGo Instant Answer API.
const fetchFromDuckDuckGo = async (
  query: string,
): Promise<WebSearchResult | null> => {
  const url = new URL(DUCKDUCKGO_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('no_html', '1');

  const response = await fetchWithTimeout(url, { headers: REQUEST_HEADERS });
  if (!response.ok) {
    throw new Error(`DuckDuckGo request failed: ${response.status}`);
  }

  const data = (await response.json()) as DuckDuckGoResponse;
  if (!data.AbstractText) return null;

  return {
    provider: data.AbstractSource ?? 'DuckDuckGo',
    title: data.Heading ?? query,
    snippet: data.AbstractText,
    sourceUrl: data.AbstractURL || undefined,
  };
};

// Keyless layer: Wikipedia (search for the best page, then fetch its summary).
const fetchFromWikipedia = async (
  query: string,
): Promise<WebSearchResult | null> => {
  const searchUrl = new URL(WIKIPEDIA_SEARCH_URL);
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('limit', '3');

  const searchResponse = await fetchWithTimeout(searchUrl, {
    headers: REQUEST_HEADERS,
  });
  if (!searchResponse.ok) {
    throw new Error(`Wikipedia search failed: ${searchResponse.status}`);
  }

  const search = (await searchResponse.json()) as WikipediaSearchResponse;
  const page = search.pages?.[0];
  if (!page) return null;

  const summaryResponse = await fetchWithTimeout(
    `${WIKIPEDIA_SUMMARY_URL}/${encodeURIComponent(page.key)}`,
    { headers: REQUEST_HEADERS },
  );
  if (!summaryResponse.ok) {
    throw new Error(`Wikipedia summary failed: ${summaryResponse.status}`);
  }

  const summary = (await summaryResponse.json()) as WikipediaSummaryResponse;
  if (!summary.extract) return null;

  return {
    provider: 'Wikipedia',
    title: summary.title ?? page.title,
    snippet: summary.extract,
    sourceUrl: summary.content_urls?.desktop?.page,
  };
};

const formatResult = (result: WebSearchResult, fallbackUrl: string): string => {
  const lines = [result.title, '', result.snippet, ''];
  if (result.sourceUrl) {
    lines.push(`Source (${result.provider}): ${result.sourceUrl}`);
  }
  lines.push(`Search the web for more: ${fallbackUrl}`);
  return lines.join('\n');
};

const webSearchSchema = z.object({
  query: z
    .string()
    .describe('The search query describing the information to look up'),
});

export class WebSearchTool extends BaseTool<typeof webSearchSchema> {
  public readonly name = 'webSearch';

  public readonly description = dedent`
        Use this tool to perform a standard web search for any external or
        up-to-date information (facts, news, definitions, people, places,
        organizations, current events, and other public knowledge). It uses
        Tavily when an API key is configured for the best quality, otherwise it
        falls back to DuckDuckGo and Wikipedia. If no provider has data, the
        tool returns a web-search URL the user can open to find more.
    `;

  public readonly schema = webSearchSchema;

  public async execute({
    query,
  }: z.infer<typeof webSearchSchema>): Promise<string> {
    console.log(`Searching the web for "${query}"`);

    const fallbackUrl = buildFallbackSearchUrl(query);

    // Try providers in order of quality: Tavily (keyed) first, then keyless
    // DuckDuckGo and Wikipedia. Each layer is best-effort: a provider error is
    // logged and we move on to the next one.
    const providers = [
      fetchFromTavily,
      fetchFromDuckDuckGo,
      fetchFromWikipedia,
    ];
    for (const fetchFrom of providers) {
      try {
        const result = await fetchFrom(query);
        if (result) {
          return formatResult(result, fallbackUrl);
        }
      } catch (error) {
        console.error(`Web search provider failed for "${query}":`, error);
      }
    }

    // Final fallback: hand back a web-search URL.
    return dedent`
      No direct answer was found for "${query}".
      You can search the web for more information here: ${fallbackUrl}
    `;
  }
}
