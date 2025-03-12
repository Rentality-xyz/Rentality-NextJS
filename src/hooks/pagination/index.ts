import { DefinedUseQueryResult } from "@tanstack/react-query";

export type PaginatedData<T> = {
  pageData: T[];
  currentPage: number;
  totalPageCount: number;
};

export type UsePaginationResult<T> = DefinedUseQueryResult<PaginatedData<T>, Error> & {
  fetchData: (page?: number, itemsPerPage?: number, filters?: Record<string, any>) => Promise<void>;
};
