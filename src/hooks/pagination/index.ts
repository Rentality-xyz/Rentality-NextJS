import { useState, useMemo } from "react";
import { QueryKey, useQuery } from "@tanstack/react-query";

export type PaginatedData<T> = {
  isLoading: boolean;
  data: {
    pageData: T[];
    currentPage: number;
    totalPageCount: number;
  };
  error: Error | null;
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

export function usePaginationForListApi<T extends Record<string, any>>(
  queryKey: QueryKey,
  fetchListFn: () => Promise<T[]>,
  enabled: boolean,
  initialPage: number = 1,
  initialItemsPerPage: number = 10
): PaginatedData<T> {
  const { currentPage, itemsPerPage, filters, updatePagination } = usePaginationState(initialPage, initialItemsPerPage);

  const {
    isLoading,
    data: allData,
    error,
  } = useQuery({
    queryKey: [...queryKey],
    queryFn: fetchListFn,
    enabled: enabled,
  });

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

  return { isLoading, data: { pageData, currentPage, totalPageCount }, error, fetchData };
}

export function usePaginationForListApiWithFilter<T>(
  queryKey: QueryKey,
  fetchListFn: (filters: Record<string, any>) => Promise<T[]>,
  initialPage: number = 1,
  initialItemsPerPage: number = 10
): PaginatedData<T> {
  const { currentPage, itemsPerPage, filters, updatePagination } = usePaginationState(initialPage, initialItemsPerPage);

  const {
    isLoading,
    data: fullData,
    error,
  } = useQuery({
    queryKey: [...queryKey, filters],
    queryFn: () => fetchListFn(filters),
  });

  const totalPageCount = useMemo(() => {
    if (!fullData) return 0;
    return Math.ceil(fullData.length / itemsPerPage);
  }, [fullData, itemsPerPage]);

  const pageData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return fullData?.slice(startIndex, startIndex + itemsPerPage) || [];
  }, [fullData, currentPage, itemsPerPage]);

  const fetchData = async (page: number = 1, itemsPerPage: number = 10, filters: Record<string, any> = {}) => {
    await updatePagination(page, itemsPerPage, filters);
  };

  return { isLoading, data: { pageData, currentPage, totalPageCount }, error, fetchData };
}

export function usePaginationForListApiWithPages<T>(
  queryKey: QueryKey,
  fetchListFn: (page: number, itemsPerPage: number) => Promise<T[]>,
  initialPage: number = 1,
  initialItemsPerPage: number = 10
): PaginatedData<T> {
  const { currentPage, itemsPerPage, updatePagination } = usePaginationState(initialPage, initialItemsPerPage);

  const {
    isLoading,
    data: pageData,
    error,
  } = useQuery({
    queryKey: [...queryKey, currentPage, itemsPerPage],
    queryFn: () => fetchListFn(currentPage, itemsPerPage),
  });

  const totalPageCount = useMemo(() => {
    // Assuming the API includes a header/metadata for total item count.
    // Replace `totalItems` with actual metadata from your API.
    const totalItems = 100; // Example
    return Math.ceil(totalItems / itemsPerPage);
  }, [itemsPerPage]);

  const fetchData = async (page: number = 1, itemsPerPage: number = 10, filters: Record<string, any> = {}) => {
    await updatePagination(page, itemsPerPage);
  };

  return { isLoading, data: { pageData: pageData || [], currentPage, totalPageCount }, error, fetchData };
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
  initialItemsPerPage: number = 10
): PaginatedData<T> {
  const { currentPage, itemsPerPage, filters, updatePagination } = usePaginationState(initialPage, initialItemsPerPage);

  const { isLoading, data, error } = useQuery({
    queryKey: [...queryKey, currentPage, itemsPerPage, filters],
    queryFn: () => fetchListFn(currentPage, itemsPerPage, filters),
  });

  const totalPageCount = useMemo(() => {
    if (!data) return 0;
    return Math.ceil(data.totalItems / itemsPerPage);
  }, [data, itemsPerPage]);

  const fetchData = async (page: number = 1, itemsPerPage: number = 10, filters: Record<string, any> = {}) => {
    await updatePagination(page, itemsPerPage, filters);
  };

  return {
    isLoading,
    data: { pageData: data?.data || [], currentPage, totalPageCount },
    error,
    fetchData,
  };
}
