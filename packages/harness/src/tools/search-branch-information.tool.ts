import { z } from 'zod';
import type {
  CompanyInfo,
  DuckDuckGoResponse,
  WikipediaSearchResponse,
  WikipediaSummaryResponse,
} from '../types/search-branch-information';
import { dedent } from '../utils/index';
import { BaseTool } from './base/base-tool';

const WIKIPEDIA_SEARCH_URL =
  'https://en.wikipedia.org/w/rest.php/v1/search/page';
const WIKIPEDIA_SUMMARY_URL =
  'https://en.wikipedia.org/api/rest_v1/page/summary';
const DUCKDUCKGO_URL = 'https://api.duckduckgo.com/';
const GOOGLE_SEARCH_URL = 'https://www.google.com/search';

// Wikipedia (and DuckDuckGo) ask API clients to identify themselves.
const REQUEST_HEADERS = { 'User-Agent': 'livekit-agent/1.0 (call-center)' };

// Build a Google search URL to fall back on when no provider has data.
const buildFallbackSearchUrl = (company: string): string => {
  const url = new URL(GOOGLE_SEARCH_URL);
  url.searchParams.set('q', `${company} company information`);
  return url.toString();
};

// First layer: Wikipedia (search for the best page, then fetch its summary).
const fetchFromWikipedia = async (
  company: string,
): Promise<CompanyInfo | null> => {
  const searchUrl = new URL(WIKIPEDIA_SEARCH_URL);
  searchUrl.searchParams.set('q', company);
  searchUrl.searchParams.set('limit', '3');

  const searchResponse = await fetch(searchUrl, { headers: REQUEST_HEADERS });
  if (!searchResponse.ok) {
    throw new Error(`Wikipedia search failed: ${searchResponse.status}`);
  }

  const search = (await searchResponse.json()) as WikipediaSearchResponse;
  const page = search.pages?.[0];
  if (!page) return null;

  const summaryResponse = await fetch(
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
    description: summary.description ?? page.description ?? undefined,
    extract: summary.extract,
    sourceUrl: summary.content_urls?.desktop?.page,
  };
};

// Second layer: DuckDuckGo Instant Answer API.
const fetchFromDuckDuckGo = async (
  company: string,
): Promise<CompanyInfo | null> => {
  const url = new URL(DUCKDUCKGO_URL);
  url.searchParams.set('q', company);
  url.searchParams.set('format', 'json');
  url.searchParams.set('no_html', '1');

  const response = await fetch(url, { headers: REQUEST_HEADERS });
  if (!response.ok) {
    throw new Error(`DuckDuckGo request failed: ${response.status}`);
  }

  const data = (await response.json()) as DuckDuckGoResponse;
  if (!data.AbstractText) return null;

  return {
    provider: data.AbstractSource ?? 'DuckDuckGo',
    title: data.Heading ?? company,
    extract: data.AbstractText,
    sourceUrl: data.AbstractURL || undefined,
  };
};

const formatCompanyInfo = (info: CompanyInfo, fallbackUrl: string): string => {
  const lines = [info.title];
  if (info.description) {
    lines.push(`(${info.description})`);
  }
  lines.push('', info.extract, '');
  if (info.sourceUrl) {
    lines.push(`Source (${info.provider}): ${info.sourceUrl}`);
  }
  lines.push(`Search the web for more: ${fallbackUrl}`);
  return lines.join('\n');
};

const searchBranchInformationSchema = z.object({
  company: z
    .string()
    .describe('The name of the company or organization to look up'),
});

export class SearchBranchInformationTool extends BaseTool<
  typeof searchBranchInformationSchema
> {
  public readonly name = 'searchBranchInformation';

  public readonly description = dedent`
        Use this tool to look up information about a company or organization
        (e.g. what it does, where it is headquartered, its industry, history,
        or other public details). It checks Wikipedia first, then DuckDuckGo.
        If neither has data, the tool returns a web-search URL the user can
        open to find more information.
    `;

  public readonly schema = searchBranchInformationSchema;

  public async execute({
    company,
  }: z.infer<typeof searchBranchInformationSchema>): Promise<string> {
    console.log(`Searching company information for ${company}`);

    const fallbackUrl = buildFallbackSearchUrl(company);

    // Try Wikipedia first, then DuckDuckGo. Each layer is best-effort: a
    // provider error is logged and we move on to the next one.
    const providers = [fetchFromWikipedia, fetchFromDuckDuckGo];
    for (const fetchFrom of providers) {
      try {
        const info = await fetchFrom(company);
        if (info) {
          return formatCompanyInfo(info, fallbackUrl);
        }
      } catch (error) {
        console.error(`Provider lookup failed for ${company}:`, error);
      }
    }

    // Final fallback: hand back a web-search URL.
    return dedent`
      No information was found for "${company}" on Wikipedia or DuckDuckGo.
      You can search the web for more information here: ${fallbackUrl}
    `;
  }
}
