export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult {
  offset: number;
  limit: number;
  totalPages: (total: number) => number;
}

export const calculatePagination = (params: PaginationParams): PaginationResult => {
  const page = Math.max(1, params.page);
  const limit = Math.max(1, params.limit);
  const offset = (page - 1) * limit;

  return {
    offset,
    limit,
    totalPages: (total: number) => Math.ceil(total / limit),
  };
};
