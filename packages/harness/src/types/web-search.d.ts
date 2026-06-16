// Tavily Search API (POST https://api.tavily.com/search). Only the fields the
// tool reads are declared.
export interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

export interface TavilyResponse {
  answer?: string;
  results?: TavilyResult[];
}

// DuckDuckGo Instant Answer API (https://api.duckduckgo.com/?q=...&format=json).
export interface DuckDuckGoResponse {
  Heading?: string;
  AbstractText?: string;
  AbstractURL?: string;
  AbstractSource?: string;
  RelatedTopics?: { Text?: string; FirstURL?: string }[];
}

// Wikipedia REST search (/w/rest.php/v1/search/page).
export interface WikipediaSearchPage {
  key: string;
  title: string;
  description?: string | null;
  excerpt?: string;
}

export interface WikipediaSearchResponse {
  pages?: WikipediaSearchPage[];
}

// Wikipedia page summary (/api/rest_v1/page/summary/{title}).
export interface WikipediaSummaryResponse {
  type?: string;
  title?: string;
  description?: string;
  extract?: string;
  content_urls?: {
    desktop?: { page?: string };
  };
}

// Normalized search result shared by every provider.
export interface WebSearchResult {
  provider: string;
  title: string;
  snippet: string;
  sourceUrl?: string | undefined;
}
