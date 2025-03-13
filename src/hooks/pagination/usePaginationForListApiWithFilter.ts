import { useMemo } from "react";
import { DefaultError, QueryClient, QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { UsePaginationResult } from ".";
import { usePaginationState } from "./usePaginationState";

export function usePaginationForListApiWithFilter<
  TQueryFnData extends { [key: string]: any },
  TError = DefaultError,
  TData extends { [key: string]: any } = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: Omit<UseQueryOptions<TQueryFnData[], TError, TData[], TQueryKey>, "queryFn"> & {
    queryFn: (filters: Record<string, any>) => TQueryFnData[] | Promise<TQueryFnData[]>;
  },
  initialPage: number = 1,
  initialItemsPerPage: number = 10,
  queryClient?: QueryClient
): UsePaginationResult<TData> {
  const { currentPage, itemsPerPage, filters, updatePagination } = usePaginationState(initialPage, initialItemsPerPage);

  const queryResult = useQuery({ ...options, queryFn: () => options.queryFn(filters) }, queryClient);

  const { data: filteredData } = queryResult;

  const totalPageCount = useMemo(() => {
    if (!filteredData) return 0;
    return Math.ceil(filteredData.length / itemsPerPage);
  }, [filteredData, itemsPerPage]);

  const pageData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData?.slice(startIndex, startIndex + itemsPerPage) ?? [];
  }, [filteredData, currentPage, itemsPerPage]);

  const fetchData = async (page: number = 1, itemsPerPage: number = 10, filters: Record<string, any> = {}) => {
    await updatePagination(page, itemsPerPage, filters);
  };

  return {
    ...queryResult,
    data: { pageData, currentPage, totalPageCount },
    fetchData,
  } as unknown as UsePaginationResult<TData>;
}
