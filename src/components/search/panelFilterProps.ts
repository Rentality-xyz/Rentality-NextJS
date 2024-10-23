export interface IPanelFilterProps {
  id: string;
  onClickReset: () => void;
  onClickApply: (selectedValues: number[]) => void;
  isResetFilters: boolean;
}
