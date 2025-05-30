import { SearchCarFilters } from "@/model/SearchCarRequest";

export interface IPanelFilterProps {
  id: string;
  onClickReset: () => void;
  onClickApply: (selectedValues: number[]) => void;
  isResetFilters: boolean;
  minValue?: number;
  maxValue?: number;
  scrollInfo: number | null;
  defaultSearchCarFilters: SearchCarFilters;
}
