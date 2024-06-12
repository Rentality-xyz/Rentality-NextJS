import { SearchCarInfo } from "@/model/SearchCarsResult";
import RntButton from "../common/rntButton";
import { Avatar } from "@mui/material";
import { useMemo } from "react";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import SearchCarDeliveryExtraInfo from "../search/searchCarDeliveryExtraInfo";

type TFunction = (key: string, options?: { [key: string]: any }) => string;

export default function CarSearchItem({
  searchInfo,
  handleRentCarRequest,
  disableButton,
  isSelected,
  setSelected,
  t,
}: {
  searchInfo: SearchCarInfo;
  handleRentCarRequest: (carInfo: SearchCarInfo) => void;
  disableButton: boolean;
  isSelected: boolean;
  setSelected: (carID: Number) => void;
  t: TFunction;
}) {
  const { showCustomDialog, hideDialogs } = useRntDialogs();
  const t_item: TFunction = (name, options) => {
    return t("car_search_item." + name, options);
  };

  const mainClasses = useMemo(() => {
    const classNames = "bg-rentality-bg rnt-card flex flex-col md:flex-row rounded-xl overflow-hidden cursor-pointer";
    return isSelected ? classNames + " border-2" : classNames;
  }, [isSelected]);

  const handleInfoClick = () => {
    showCustomDialog(
      <SearchCarDeliveryExtraInfo
        hostHomeLocation={searchInfo.hostHomeLocation}
        deliveryPrices={{
          from1To25milesPrice: searchInfo.deliveryPrices.from1To25milesPrice,
          over25MilesPrice: searchInfo.deliveryPrices.over25MilesPrice,
        }}
        isInsuranceIncluded={searchInfo.isInsuranceIncluded}
        handleClose={hideDialogs}
        t={t}
      />
    );
  };

  return (
    <div className={mainClasses} onClick={() => setSelected(searchInfo.carId)}>
      {/* <div className="w-60 h-full min-h-[14rem] flex-shrink-0">
        <Image
          src={searchInfo.image}
          alt=""
          width={1000}
          height={1000}
          className="h-full w-full object-cover"
        />
      </div> */}
      <div
        style={{ backgroundImage: `url(${searchInfo.image})` }}
        className="relative w-full md:w-64 min-h-[12rem] flex-shrink-0 bg-center bg-cover"
      />
      <div className="flex w-full flex-col justify-between p-2 sm:p-4">
        <div className="flex flex-row items-baseline justify-between ">
          <div className="w-full overflow-hidden">
            <strong className="text-lg truncate">{`${searchInfo.brand} ${searchInfo.model} ${searchInfo.year}`}</strong>
          </div>
        </div>
        <div className="flex md:grid md:grid-cols-[2fr_1fr] text-sm mt-2 md:justify-between">
          <div className="w-8/12 lg:w-9/12 flex flex-col">
            {isNaN(searchInfo.pricePerDayWithDiscount) ||
            searchInfo.pricePerDayWithDiscount === searchInfo.pricePerDay ? (
              <div className="text-base">
                <strong>
                  ${displayMoneyWith2Digits(searchInfo.pricePerDay)}
                  {t_item("per_day")}
                </strong>
              </div>
            ) : (
              <div className="text-base">
                <strong>
                  ${displayMoneyWith2Digits(searchInfo.pricePerDayWithDiscount)}
                  {t_item("per_day")}
                </strong>
                <strong className="ml-8 text-[#8B8B8F] line-through">
                  ${displayMoneyWith2Digits(searchInfo.pricePerDay)}
                  {t_item("per_day")}
                </strong>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2">
              <div>
                <span>${displayMoneyWith2Digits(searchInfo.pricePerDay)}</span>
                <span className="mx-0.5">x</span>
                <span>
                  {searchInfo.tripDays} {t_item("days")}
                </span>
              </div>
              <span className="ml-8">${displayMoneyWith2Digits(searchInfo.pricePerDay * searchInfo.tripDays)}</span>
            </div>

            <div className="grid grid-cols-2">
              <span className="text-rentality-secondary-shade">{searchInfo.daysDiscount}</span>
              <span className="ml-8 text-rentality-secondary-shade">{searchInfo.totalDiscount}</span>
            </div>

            <div className="grid grid-cols-2">
              <span> {t_item("price_without_taxes")}</span>
              <span className="ml-8">${displayMoneyWith2Digits(searchInfo.totalPriceWithDiscount)}</span>
            </div>
          </div>
          <div className="flex flex-col w-auto">
            <div>- {searchInfo.engineTypeText}</div>
            <div>- {searchInfo.transmission}</div>
            <div>
              - {searchInfo.seatsNumber} {t_item("seats")}
            </div>
            <div className="mt-4 grid grid-cols-2">
              <span>{t_item("delivery_fee")}</span>
              <span className="max-md:ml-4">${displayMoneyWith2Digits(searchInfo.deliveryFee)}</span>
              <span>{t_item("taxes")}</span>
              <span className="max-md:ml-4">${displayMoneyWith2Digits(searchInfo.taxes)}</span>
              <span>{t_item("deposit")}</span>
              <span className="max-md:ml-4">${displayMoneyWith2Digits(searchInfo.securityDeposit)}</span>
            </div>
          </div>
        </div>
        <div className="w-full grid grid-cols-[1fr_auto] items-end mt-4">
          <div className="flex flex-row items-center truncate">
            <div className="w-12 h-12 self-center mr-2">
              <Avatar src={searchInfo.hostPhotoUrl} sx={{ width: "3rem", height: "3rem" }}></Avatar>
            </div>
            <div className="flex flex-col">
              <p className="text-xs">{t_item("host")}</p>
              <p className="text-sm">{searchInfo.hostName ?? "-"}</p>
            </div>
            <div className="ml-8" onClick={handleInfoClick}>
              <i className="fi fi-rs-info text-2xl"></i>
            </div>
          </div>
          <RntButton
            className="h-14 w-44 text-base"
            onClick={() => handleRentCarRequest(searchInfo)}
            disabled={disableButton}
          >
            <div>{t_item("rent_for", { days: searchInfo.tripDays })}</div>
            <div>
              {t_item("total")} $
              {displayMoneyWith2Digits(
                searchInfo.totalPriceWithDiscount +
                  searchInfo.taxes +
                  searchInfo.securityDeposit +
                  searchInfo.deliveryFee
              )}
            </div>
          </RntButton>
        </div>
      </div>
    </div>
  );
}
