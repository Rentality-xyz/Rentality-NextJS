import { useState, useMemo } from "react";
import {
  DefaultError,
  DefinedUseQueryResult,
  QueryClient,
  QueryKey,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";

export type PaginatedData<T> = {
  pageData: T[];
  currentPage: number;
  totalPageCount: number;
};

export type UsePaginationResult<T> = DefinedUseQueryResult<PaginatedData<T>, Error> & {
  fetchData: (page?: number, itemsPerPage?: number, filters?: Record<string, any>) => Promise<void>;
};

export function usePaginationState(initialPage: number = 1, initialItemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const updatePagination = async (
    page: number = 1,
    itemsPerPage: number = 10,
    newFilters: Record<string, any> = {}
  ) => {
    setCurrentPage(page);
    setItemsPerPage(itemsPerPage);
    setFilters(newFilters);
  };

  return { currentPage, itemsPerPage, filters, updatePagination };
}

export function usePaginationForListApi<
  TQueryFnData extends { [key: string]: any },
  TError = DefaultError,
  TData extends { [key: string]: any } = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: Omit<UseQueryOptions<TQueryFnData[], TError, TData[], TQueryKey>, "queryFn"> & {
    queryFn: () => TQueryFnData[] | Promise<TQueryFnData[]>;
  },
  initialPage: number = 1,
  initialItemsPerPage: number = 10,
  queryClient?: QueryClient
): UsePaginationResult<TData> {
  const { currentPage, itemsPerPage, filters, updatePagination } = usePaginationState(initialPage, initialItemsPerPage);
  const queryResult = useQuery(options, queryClient);

  const { data: allData } = queryResult;

  const filteredData = useMemo(() => {
    if (!allData) return [];
    return allData.filter((item) => Object.entries(filters).every(([key, value]) => item[key] === value));
  }, [allData, filters]);

  const totalPageCount = useMemo(() => {
    if (!filteredData) return 0;
    return Math.ceil(filteredData.length / itemsPerPage);
  }, [filteredData, itemsPerPage]);

  const pageData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const fetchData = async (page: number = 1, itemsPerPage: number = 10, filters: Record<string, any> = {}) => {
    await updatePagination(page, itemsPerPage, filters);
  };

  return { ...queryResult, data: { pageData, currentPage, totalPageCount }, fetchData } as UsePaginationResult<TData>;
}

export function usePaginationForListApiWithFilter<T>(
  queryKey: QueryKey,
  fetchListFn: (filters: Record<string, any>) => Promise<T[]>,
  initialPage: number = 1,
  initialItemsPerPage: number = 10,
  queryOptions?: Omit<UseQueryOptions<T[]>, "queryKey">
): UsePaginationResult<T> {
  const { currentPage, itemsPerPage, filters, updatePagination } = usePaginationState(initialPage, initialItemsPerPage);
  const { enabled = true, gcTime } = queryOptions ?? {};

  const queryResult = useQuery({
    queryKey: [...queryKey, filters],
    queryFn: () => fetchListFn(filters),
    enabled,
    gcTime,
  });

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

  return { ...queryResult, data: { pageData, currentPage, totalPageCount }, fetchData } as UsePaginationResult<T>;
}

export function usePaginationForListApiWithPages<T>(
  queryKey: QueryKey,
  fetchListFn: (page: number, itemsPerPage: number) => Promise<T[]>,
  initialPage: number = 1,
  initialItemsPerPage: number = 10,
  queryOptions?: Omit<UseQueryOptions<T[]>, "queryKey">
): UsePaginationResult<T> {
  const { currentPage, itemsPerPage, updatePagination } = usePaginationState(initialPage, initialItemsPerPage);
  const { enabled = true, gcTime } = queryOptions ?? {};

  const queryResult = useQuery({
    queryKey: [...queryKey, currentPage, itemsPerPage],
    queryFn: () => fetchListFn(currentPage, itemsPerPage),
    enabled,
    gcTime,
  });

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
  } as UsePaginationResult<T>;
}

export function usePaginationForListApiWithPagesAndFilters<T>(
  queryKey: QueryKey,
  fetchListFn: (
    page: number,
    itemsPerPage: number,
    filters: Record<string, any>
  ) => Promise<{
    data: T[];
    totalItems: number;
  }>,
  initialPage: number = 1,
  initialItemsPerPage: number = 10,
  queryOptions?: Omit<
    UseQueryOptions<{
      data: T[];
      totalItems: number;
    }>,
    "queryKey"
  >
): UsePaginationResult<T> {
  const { currentPage, itemsPerPage, filters, updatePagination } = usePaginationState(initialPage, initialItemsPerPage);
  const { enabled = true, gcTime } = queryOptions ?? {};

  const queryResult = useQuery({
    queryKey: [...queryKey, currentPage, itemsPerPage, filters],
    queryFn: () => fetchListFn(currentPage, itemsPerPage, filters),
    enabled,
    gcTime,
  });

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
  } as UsePaginationResult<T>;
}
