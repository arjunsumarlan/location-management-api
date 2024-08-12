export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  nextPage: number | null;
  previousPage: number | null;
}

export interface PaginatedResult<T> {
  data: T[];
  metadata: PaginationMetadata;
}
