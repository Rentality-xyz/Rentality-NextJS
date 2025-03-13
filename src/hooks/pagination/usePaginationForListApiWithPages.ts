import { useMemo } from "react";
import { DefaultError, QueryClient, QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { UsePaginationResult } from ".";
import { usePaginationState } from "./usePaginationState";

export function usePaginationForListApiWithPages<
  TQueryFnData extends { [key: string]: any },
  TError = DefaultError,
  TData extends { [key: string]: any } = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: Omit<UseQueryOptions<TQueryFnData[], TError, TData[], TQueryKey>, "queryFn"> & {
    queryFn: (page: number, itemsPerPage: number) => TQueryFnData[] | Promise<TQueryFnData[]>;
  },
  initialPage: number = 1,
  initialItemsPerPage: number = 10,
  queryClient?: QueryClient
): UsePaginationResult<TData> {
  const { currentPage, itemsPerPage, updatePagination } = usePaginationState(initialPage, initialItemsPerPage);

  const queryResult = useQuery({ ...options, queryFn: () => options.queryFn(currentPage, itemsPerPage) }, queryClient);

  const { data: pageData } = queryResult;

  const totalPageCount = useMemo(() => {
    // Assuming the API includes a header/metadata for total item count.
    // Replace `totalItems` with actual metadata from your API.
    const totalItems = 100; // Example
    return Math.ceil(totalItems / itemsPerPage);
  }, [itemsPerPage]);

  const fetchData = async (page: number = 1, itemsPerPage: number = 10, filters: Record<string, any> = {}) => {
    await updatePagination(page, itemsPerPage);
  };

  return {
    ...queryResult,
    data: { pageData: pageData ?? [], currentPage, totalPageCount },
    fetchData,
  } as unknown as UsePaginationResult<TData>;
}
