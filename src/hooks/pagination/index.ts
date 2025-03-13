import { UseQueryResult } from "@tanstack/react-query";

export type PaginatedData<T> = {
  pageData: T[];
  currentPage: number;
  totalPageCount: number;
};

export type UsePaginationResult<T> = Omit<UseQueryResult<PaginatedData<T>, Error>, "refetch" | "data"> & {
  data: PaginatedData<T>;
  fetchData: (page?: number, itemsPerPage?: number, filters?: Record<string, any>) => Promise<void>;
};
