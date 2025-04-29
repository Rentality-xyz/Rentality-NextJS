import { FilterDefinition } from "@/model/filters";

export type SearchSortFilterKey = "search_and_filters.sort_filter";
export type SearchSortFilterValueKey = "price_asc" | "price_desc" | "distance";

export const searchSortFilters: FilterDefinition<SearchSortFilterValueKey> = {
  key: "search_and_filters.sort_filter",
  options: [{ key: "price_asc" }, { key: "price_desc" }, { key: "distance" }],
};
