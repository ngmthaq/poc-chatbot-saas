// open.er-api.com /v6/latest/{base} response.
export interface ExchangeRateResponse {
  result: 'success' | 'error';
  base_code?: string;
  rates?: Record<string, number>;
  time_last_update_utc?: string;
  'error-type'?: string;
}
