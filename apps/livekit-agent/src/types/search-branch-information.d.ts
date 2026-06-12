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

// DuckDuckGo Instant Answer API (https://api.duckduckgo.com/?q=...&format=json).
export interface DuckDuckGoResponse {
  Heading?: string;
  AbstractText?: string;
  AbstractURL?: string;
  AbstractSource?: string;
}

// Normalized company info shared by every provider.
export interface CompanyInfo {
  provider: string;
  title: string;
  description?: string | undefined;
  extract: string;
  sourceUrl?: string | undefined;
}
