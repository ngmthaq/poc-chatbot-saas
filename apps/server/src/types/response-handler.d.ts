export interface SuccessResponseBody<TData = unknown> {
  status: number;
  data: TData | null;
  timestamp: string;
}
