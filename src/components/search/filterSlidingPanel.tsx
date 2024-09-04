import SlidingPanel from "react-sliding-side-panel";
import RntInput from "../common/rntInput";
import RntButton from "../common/rntButton";
import { TFunction } from "i18next";
import { useEffect, useState } from "react";
import { useAppContext } from "@/contexts/appContext";
import RntCarMakeSelect from "@/components/common/rntCarMakeSelect";
import RntCarModelSelect from "@/components/common/rntCarModelSelect";
import { SearchCarFilters } from "@/model/SearchCarRequest";
import { isEmpty } from "@/utils/string";

export default function FilterSlidingPanel({
  initValue,
  onFilterApply,
  isOpen,
  closePanel,
  t,
}: {
  initValue: SearchCarFilters;
  onFilterApply: (filters: SearchCarFilters) => Promise<void>;
  isOpen: boolean;
  closePanel: () => void;
  t: TFunction;
}) {
  const { closeFilterOnSearchPage } = useAppContext();
  const [searchCarFilters, setSearchCarFilters] = useState<SearchCarFilters>(initValue);

  const [selectedMakeID, setSelectedMakeID] = useState<string>("");
  const [selectedModelID, setSelectedModelID] = useState<string>("");

  function t_comp(element: string) {
    return t("filter_sliding_panel." + element);
  }

  function handleNumberInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = !isEmpty(e.target.value) ? Number(e.target.value) : undefined;
    if (value !== undefined && isNaN(value)) return;

    const name = e.target.name;

    setSearchCarFilters({
      ...searchCarFilters,
      [name]: value,
    });
  }

  function handleApplyClick() {
    onFilterApply(searchCarFilters);
    handleClose();
  }

  function handleResetClick() {
    setSearchCarFilters({});
  }

  function handleClose() {
    closePanel();
    closeFilterOnSearchPage();
  }

  useEffect(() => {
    setSearchCarFilters(initValue);
  }, [initValue]);

  return (
    <div className="sliding-panel-container fixed left-0 top-0 w-full">
      <SlidingPanel
        type={"left"}
        isOpen={isOpen}
        size={100}
        noBackdrop={false}
        backdropClicked={handleClose}
        panelContainerClassName="sliding-panel"
      >
        <div className="flex flex-col py-8">
          <div className="mr-8 self-end">
            <i className="fi fi-br-cross" onClick={handleClose}></i>
          </div>
          <div className="mt-4 flex flex-col gap-2 px-2 sm:gap-4 sm:px-4 md:px-8 lg:px-16">
            <RntCarMakeSelect
              id={"filter-brand"}
              label={t_comp("brand")}
              value={searchCarFilters.brand ?? ""}
              onMakeSelect={(newID, newMake) => {
                setSelectedMakeID(newID);
                setSearchCarFilters({
                  ...searchCarFilters,
                  brand: newMake,
                });
              }}
            />

            <RntCarModelSelect
              id={"filter-model"}
              label={t_comp("model")}
              value={searchCarFilters.model ?? ""}
              make_id={selectedMakeID}
              onModelSelect={(newID, newModel) => {
                setSelectedModelID(newID);
                setSearchCarFilters({
                  ...searchCarFilters,
                  model: newModel,
                });
              }}
            />
            <RntInput
              id="yearOfProductionFrom"
              label={t_comp("year_from")}
              value={searchCarFilters.yearOfProductionFrom ?? ""}
              onChange={handleNumberInputChange}
            />
            <RntInput
              id="yearOfProductionTo"
              label={t_comp("year_to")}
              value={searchCarFilters.yearOfProductionTo ?? ""}
              onChange={handleNumberInputChange}
            />
            <RntInput
              id="pricePerDayInUsdFrom"
              label={t_comp("price_from")}
              value={searchCarFilters.pricePerDayInUsdFrom ?? ""}
              onChange={handleNumberInputChange}
            />
            <RntInput
              id="pricePerDayInUsdTo"
              label={t_comp("price_to")}
              value={searchCarFilters.pricePerDayInUsdTo ?? ""}
              onChange={handleNumberInputChange}
            />
            <div className="flex flex-col gap-4 max-sm:mt-2 sm:flex-row sm:justify-between sm:gap-8">
              <RntButton className="max-sm:h-10 max-sm:w-full" type="button" onClick={handleApplyClick}>
                {t_comp("button_apply")}
              </RntButton>
              <RntButton className="max-sm:h-10 max-sm:w-full" type="button" onClick={handleResetClick}>
                {t_comp("button_reset")}
              </RntButton>
            </div>
          </div>
        </div>
      </SlidingPanel>
    </div>
  );
}
