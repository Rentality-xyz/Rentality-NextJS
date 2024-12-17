import { SearchCarInfo } from "@/model/SearchCarsResult";
import RntButton from "../common/rntButton";
import { Avatar } from "@mui/material";
import { useMemo } from "react";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { getEngineTypeString } from "@/model/EngineType";
import Image from "next/image";
import MenuIcons, { getImageForMenu } from "../sideNavMenu/menuIcons";
import { useTranslation } from "react-i18next";

type TFunction = (key: string, options?: { [key: string]: any }) => string;

export default function CarSearchItem({
  searchInfo,
  handleRentCarRequest,
  handleShowRequestDetails,
  disableButton,
  isSelected,
  setSelected,
}: {
  searchInfo: SearchCarInfo;
  handleRentCarRequest: (carInfo: SearchCarInfo) => void;
  handleShowRequestDetails: (carInfo: SearchCarInfo) => void;
  disableButton: boolean;
  isSelected: boolean;
  setSelected: (carID: number) => void;
}) {
  const { t } = useTranslation();

  const t_comp: TFunction = (name, options) => {
    return t("search_page.car_search_item." + name, options);
  };

  const mainClasses = useMemo(() => {
    const classNames = "bg-rentality-bg rnt-card flex flex-col md:flex-row rounded-xl overflow-hidden cursor-pointer";
    return isSelected ? classNames + " border-2" : classNames;
  }, [isSelected]);

  function handleImageClick() {
    handleShowRequestDetails(searchInfo);
  }

  function handleInfoClick() {
    handleShowRequestDetails(searchInfo);
  }

  const insurancePriceTotal =
    searchInfo.isInsuranceRequired && !searchInfo.isGuestHasInsurance
      ? searchInfo.insurancePerDayPriceInUsd * searchInfo.tripDays
      : 0;

  return (
    <div className={mainClasses} onClick={() => setSelected(searchInfo.carId)}>
      <div
        style={{ backgroundImage: `url(${searchInfo.images[0]})` }}
        className="relative min-h-[12rem] w-full flex-shrink-0 bg-cover bg-center md:w-64"
        onClick={handleImageClick}
      >
        {searchInfo.isCarDetailsConfirmed && (
          <i className="fi fi-br-hexagon-check absolute right-2 top-2 text-3xl text-green-500"></i>
        )}
      </div>
      <div className="flex w-full flex-col justify-between p-2 sm:p-4">
        <div className="flex flex-row items-baseline justify-between">
          <div className="w-full overflow-hidden">
            <strong className="truncate text-lg">{`${searchInfo.brand} ${searchInfo.model} ${searchInfo.year}`}</strong>
          </div>
        </div>
        <div className="mt-2 flex text-sm md:grid md:grid-cols-[2fr_1fr] md:justify-between">
          <div className="flex w-8/12 flex-col lg:w-9/12">
            {isNaN(searchInfo.pricePerDayWithDiscount) ||
            searchInfo.pricePerDayWithDiscount === searchInfo.pricePerDay ? (
              <div className="text-base">
                <strong>
                  ${displayMoneyWith2Digits(searchInfo.pricePerDay)}
                  {t_comp("per_day")}
                </strong>
              </div>
            ) : (
              <div className="text-base">
                <strong>
                  ${displayMoneyWith2Digits(searchInfo.pricePerDayWithDiscount)}
                  {t_comp("per_day")}
                </strong>
                <strong className="ml-8 text-[#8B8B8F] line-through">
                  ${displayMoneyWith2Digits(searchInfo.pricePerDay)}
                  {t_comp("per_day")}
                </strong>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2">
              <div>
                <span>${displayMoneyWith2Digits(searchInfo.pricePerDay)}</span>
                <span className="mx-0.5">x</span>
                <span>
                  {searchInfo.tripDays} {t_comp("days")}
                </span>
              </div>
              <span className="ml-8">${displayMoneyWith2Digits(searchInfo.pricePerDay * searchInfo.tripDays)}</span>
            </div>

            <div className="grid grid-cols-2">
              <span className="text-rentality-secondary">{searchInfo.daysDiscount}</span>
              <span className="ml-8 text-rentality-secondary">{searchInfo.totalDiscount}</span>
            </div>

            <div className="grid grid-cols-2">
              <span>{t_comp("price_without_taxes")}</span>
              <span className="ml-8">${displayMoneyWith2Digits(searchInfo.totalPriceWithDiscount)}</span>
            </div>

            {searchInfo.isInsuranceRequired && (
              <p className="mt-4 text-rentality-secondary">{t_comp("insurance_required")}</p>
            )}
          </div>
          <div className="flex w-auto flex-col">
            <div>- {getEngineTypeString(searchInfo.engineType)}</div>
            <div>- {searchInfo.transmission}</div>
            <div>
              - {searchInfo.seatsNumber} {t_comp("seats")}
            </div>
            <div className="mt-4 grid grid-cols-2">
              <span>{t_comp("delivery_fee_pick_up")}</span>
              <span className="max-md:ml-4">
                ${displayMoneyWith2Digits(searchInfo.deliveryDetails.pickUp.priceInUsd)}
              </span>
              <span>{t_comp("delivery_fee_drop_off")}</span>
              <span className="max-md:ml-4">
                ${displayMoneyWith2Digits(searchInfo.deliveryDetails.dropOff.priceInUsd)}
              </span>
              <span>{t_comp("taxes")}</span>
              <span className="max-md:ml-4">${displayMoneyWith2Digits(searchInfo.taxes)}</span>
              <span>{t_comp("deposit")}</span>
              <span className="max-md:ml-4">${displayMoneyWith2Digits(searchInfo.securityDeposit)}</span>
              {searchInfo.isInsuranceRequired && (
                <>
                  <span>
                    <Image src={getImageForMenu(MenuIcons.Insurance)} width={20} height={20} alt="" />
                  </span>
                  <span className="max-md:ml-4">${displayMoneyWith2Digits(insurancePriceTotal)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 grid w-full grid-cols-[1fr_auto] items-end">
          <div className="flex flex-row items-center truncate">
            <div className="mr-2 h-12 w-12 self-center">
              <Avatar src={searchInfo.hostPhotoUrl} sx={{ width: "3rem", height: "3rem" }}></Avatar>
            </div>
            <div className="flex flex-col">
              <p className="text-xs">{t_comp("host")}</p>
              <p className="text-sm">{searchInfo.hostName ?? "-"}</p>
            </div>
            <div className="ml-2 sm:ml-8" onClick={handleInfoClick}>
              <i className="fi fi-rs-info text-2xl text-rentality-secondary"></i>
            </div>
          </div>
          <RntButton
            className="h-14 w-44 text-base"
            onClick={() => handleRentCarRequest(searchInfo)}
            disabled={disableButton}
          >
            <div>{t_comp("rent_for", { days: searchInfo.tripDays })}</div>
            <div>
              {t_comp("total")} $
              {displayMoneyWith2Digits(
                searchInfo.totalPriceWithDiscount +
                  searchInfo.taxes +
                  searchInfo.securityDeposit +
                  searchInfo.deliveryDetails.pickUp.priceInUsd +
                  searchInfo.deliveryDetails.dropOff.priceInUsd +
                  insurancePriceTotal
              )}
            </div>
          </RntButton>
        </div>
      </div>
    </div>
  );
}
