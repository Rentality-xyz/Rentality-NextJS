import { useMemo } from "react";
import { DefaultError, QueryClient, QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { UsePaginationResult } from ".";
import { usePaginationState } from "./usePaginationState";

type PagedFnData<T> = {
  data: T[];
  totalItems: number;
};

export function usePaginationForListApiWithPagesAndFilters<
  TQueryFnData extends { [key: string]: any },
  TError = DefaultError,
  TData extends { [key: string]: any } = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: Omit<UseQueryOptions<PagedFnData<TQueryFnData>, TError, PagedFnData<TData>, TQueryKey>, "queryFn"> & {
    queryFn: (
      page: number,
      itemsPerPage: number,
      filters: Record<string, any>
    ) => PagedFnData<TQueryFnData> | Promise<PagedFnData<TQueryFnData>>;
  },
  initialPage: number = 1,
  initialItemsPerPage: number = 10,
  queryClient?: QueryClient
): UsePaginationResult<TData> {
  const { currentPage, itemsPerPage, filters, updatePagination } = usePaginationState(initialPage, initialItemsPerPage);

  const queryResult = useQuery(
    { ...options, queryFn: () => options.queryFn(currentPage, itemsPerPage, filters) },
    queryClient
  );

  const { data } = queryResult;

  const totalPageCount = useMemo(() => {
    if (!data) return 0;
    return Math.ceil(data.totalItems / itemsPerPage);
  }, [data, itemsPerPage]);

  const fetchData = async (page: number = 1, itemsPerPage: number = 10, filters: Record<string, any> = {}) => {
    await updatePagination(page, itemsPerPage, filters);
  };

  return {
    ...queryResult,
    data: { pageData: data?.data ?? [], currentPage, totalPageCount },
    fetchData,
  } as UsePaginationResult<TData>;
}
