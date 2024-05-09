import SlidingPanel from "react-sliding-side-panel";
import RntInput from "../common/rntInput";
import RntButton from "../common/rntButton";
import { TFunction as TFunctionNext } from "i18next";
import { SearchCarRequest } from "@/model/SearchCarRequest";
import { Dispatch } from "react";

export default function FilterSlidingPanel({
  searchCarRequest,
  setSearchCarRequest,
  handleSearchClick,
  openFilterPanel,
  setOpenFilterPanel,
  t,
}: {
  searchCarRequest: SearchCarRequest;
  setSearchCarRequest: Dispatch<React.SetStateAction<SearchCarRequest>>;
  handleSearchClick: () => Promise<void>;
  openFilterPanel: boolean;
  setOpenFilterPanel: Dispatch<React.SetStateAction<boolean>>;
  t: TFunctionNext;
}) {
  const t_comp = (element: string) => {
    return t("filter_sliding_panel." + element);
  };

  return (
    <div className="sliding-panel-container w-full fixed top-0 left-0">
      <SlidingPanel
        type={"left"}
        isOpen={openFilterPanel}
        size={50}
        noBackdrop={false}
        backdropClicked={() => setOpenFilterPanel(false)}
        panelContainerClassName="sliding-panel"
      >
        <div className="flex flex-col py-8">
          <div className="self-end mr-8">
            <i className="fi fi-br-cross" onClick={() => setOpenFilterPanel(false)}></i>
          </div>
          <div className="flex flex-col gap-2 sm:gap-4 px-2 sm:px-4 md:px-8 lg:px-16 mt-4">
            <RntInput
              id="filter-brand"
              label={t_comp("brand")}
              value={searchCarRequest.brand}
              onChange={(e) =>
                setSearchCarRequest({
                  ...searchCarRequest,
                  brand: e.target.value,
                })
              }
            />
            <RntInput
              id="filter-model"
              label={t_comp("model")}
              value={searchCarRequest.model}
              onChange={(e) =>
                setSearchCarRequest({
                  ...searchCarRequest,
                  model: e.target.value,
                })
              }
            />
            <RntInput
              id="filter-year-from"
              label={t_comp("year_from")}
              value={searchCarRequest.yearOfProductionFrom}
              onChange={(e) => {
                const newValue = e.target.value;
                if (isNaN(Number(newValue)) && newValue !== "") return;

                setSearchCarRequest({
                  ...searchCarRequest,
                  yearOfProductionFrom: newValue,
                });
              }}
            />
            <RntInput
              id="filter-year-yo"
              label={t_comp("year_to")}
              value={searchCarRequest.yearOfProductionTo}
              onChange={(e) => {
                const newValue = e.target.value;
                if (isNaN(Number(newValue)) && newValue !== "") return;

                setSearchCarRequest({
                  ...searchCarRequest,
                  yearOfProductionTo: newValue,
                });
              }}
            />
            <RntInput
              id="filter-price-from"
              label={t_comp("price_from")}
              value={searchCarRequest.pricePerDayInUsdFrom}
              onChange={(e) => {
                const newValue = e.target.value;
                if (isNaN(Number(newValue)) && newValue !== "") return;
                setSearchCarRequest({
                  ...searchCarRequest,
                  pricePerDayInUsdFrom: newValue,
                });
              }}
            />
            <RntInput
              id="filter-price-yo"
              label={t_comp("price_to")}
              value={searchCarRequest.pricePerDayInUsdTo}
              onChange={(e) => {
                const newValue = e.target.value;
                if (isNaN(Number(newValue)) && newValue !== "") return;

                setSearchCarRequest({
                  ...searchCarRequest,
                  pricePerDayInUsdTo: newValue,
                });
              }}
            />
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 max-sm:mt-2 sm:justify-between">
              <RntButton
                className="max-sm:h-10 max-sm:w-full"
                onClick={() => {
                  setOpenFilterPanel(false);
                  handleSearchClick();
                }}
              >
                {t_comp("button_apply")}
              </RntButton>
              <RntButton
                className="max-sm:h-10 max-sm:w-full"
                onClick={() =>
                  setSearchCarRequest((prev) => {
                    return {
                      ...prev,
                      brand: "",
                      model: "",
                      pricePerDayInUsdFrom: "",
                      pricePerDayInUsdTo: "",
                      yearOfProductionFrom: "",
                      yearOfProductionTo: "",
                    };
                  })
                }
              >
                {t_comp("button_reset")}
              </RntButton>
            </div>
          </div>
        </div>
      </SlidingPanel>
    </div>
  );
}
