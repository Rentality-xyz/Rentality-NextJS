import { UseQueryResult } from "@tanstack/react-query";

export type PaginatedData<T> = {
  pageData: T[];
  currentPage: number;
  totalPageCount: number;
};

export function getDefaultPaginatedData<T>(): PaginatedData<T> {
  return {
    pageData: [],
    currentPage: 1,
    totalPageCount: 0,
  };
}

export type UsePaginationResult<T> = UseQueryResult<PaginatedData<T>, Error> & {
  fetchData: (page?: number, itemsPerPage?: number, filters?: Record<string, any>) => Promise<void>;
};
