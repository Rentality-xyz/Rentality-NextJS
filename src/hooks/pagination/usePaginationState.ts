import { useState } from "react";

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
