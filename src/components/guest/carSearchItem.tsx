import { SearchCarInfo } from "@/model/SearchCarsResult";
import RntButton from "../common/rntButton";
import { Avatar } from "@mui/material";
import React, { useMemo, useReducer } from "react";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { getEngineTypeIcon, getEngineTypeString } from "@/model/EngineType";
import Image from "next/image";
import MenuIcons, { getImageForMenu } from "../sideNavMenu/menuIcons";
import { useTranslation } from "react-i18next";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import carSeatsIcon from "@/images/car_seats.svg";
import carTransmissionIcon from "@/images/car_transmission.svg";
import { AboutCarIcon } from "@/components/createTrip/AboutCarIcon";
import { getDiscountablePriceFromCarInfo, getNotDiscountablePriceFromCarInfo } from "@/utils/price";
import { getPromoPrice, PromoActionType, reducer } from "@/features/promocodes/promoCode";
import { PROMOCODE_MAX_LENGTH } from "@/utils/constants";
import { useForm } from "react-hook-form";
import { enterPromoFormSchema, EnterPromoFormValues } from "@/features/promocodes/models/enterPromoFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import useCheckPromo from "@/features/promocodes/hooks/useCheckPromo";

type TFunction = (key: string, options?: { [key: string]: any }) => string;

export default function CarSearchItem({
  searchInfo,
  handleRentCarRequest,
  handleShowRequestDetails,
  disableButton,
  isSelected,
  setSelected,
  isGuestHasInsurance,
}: {
  searchInfo: SearchCarInfo;
  handleRentCarRequest: (carInfo: SearchCarInfo, PromoCode?: string) => void;
  handleShowRequestDetails: (carInfo: SearchCarInfo) => void;
  disableButton: boolean;
  isSelected: boolean;
  setSelected: (carID: number) => void;
  isGuestHasInsurance: boolean;
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

  const isDisplayInsurance = searchInfo.isInsuranceRequired && !isGuestHasInsurance;
  const insurancePriceTotal = isDisplayInsurance ? searchInfo.insurancePerDayPriceInUsd * searchInfo.tripDays : 0;

  const [state, dispatch] = useReducer(reducer, { status: "NONE" });
  const { checkPromo } = useCheckPromo();
  const { register, handleSubmit } = useForm<EnterPromoFormValues>({
    resolver: zodResolver(enterPromoFormSchema),
  });
  async function onFormSubmit(formData: EnterPromoFormValues) {
    dispatch({ type: PromoActionType.LOADING });

    const result = await checkPromo(formData.enteredPromo);

    if (!result.ok) {
      dispatch({ type: PromoActionType.ERROR });
    } else {
      dispatch({ type: PromoActionType.SUCCESS, payload: { code: formData.enteredPromo, value: result.value.value } });
    }
  }

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
      <div className="flex w-full flex-col justify-between p-2 sm:pb-2 sm:pl-4 sm:pr-2 sm:pt-2">
        <div className="flex flex-row items-center justify-between">
          <div className="w-full overflow-hidden max-sm:mr-2">
            <strong className="truncate text-lg">{`${searchInfo.brand} ${searchInfo.model} ${searchInfo.year}`}</strong>
          </div>
          <div className="flex items-center">
            <div className="mr-2 truncate text-lg font-medium">{searchInfo.hostName ?? "-"}</div>
            <div className="h-12 w-12 self-center">
              <Avatar src={searchInfo.hostPhotoUrl} sx={{ width: "3rem", height: "3rem" }}></Avatar>
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-col text-sm md:grid md:grid-cols-[2fr_1fr] md:justify-between">
          <div className="flex flex-col">
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

            <div className="mt-4 flex justify-between md:grid md:grid-cols-2">
              <div>
                <span>${displayMoneyWith2Digits(searchInfo.pricePerDay)}</span>
                <span className="mx-0.5">x</span>
                <span>
                  {searchInfo.tripDays} {t_comp("days")}
                </span>
              </div>
              <span className="ml-8">${displayMoneyWith2Digits(searchInfo.pricePerDay * searchInfo.tripDays)}</span>
            </div>

            <div className="flex justify-between md:grid md:grid-cols-2">
              <span className="text-rentality-secondary">{searchInfo.daysDiscount}</span>
              <span className="ml-8 text-rentality-secondary">{searchInfo.totalDiscount}</span>
            </div>

            <div className="flex justify-between md:grid md:grid-cols-2">
              <span>{t_comp("price_without_taxes")}</span>
              <span className="ml-8">${displayMoneyWith2Digits(searchInfo.totalPriceWithDiscount)}</span>
            </div>

            {isDisplayInsurance && <p className="mt-2 text-rentality-secondary">{t_comp("insurance_required")}</p>}
          </div>
          <div className="flex flex-col justify-between max-md:mt-2">
            <div className="flex justify-between md:grid md:grid-cols-2">
              <span>{t_comp("delivery_fee_pick_up")}</span>
              <span className="max-md:ml-4">
                ${displayMoneyWith2Digits(searchInfo.deliveryDetails.pickUp.priceInUsd)}
              </span>
            </div>

            <div className="flex justify-between md:grid md:grid-cols-2">
              <span>{t_comp("delivery_fee_drop_off")}</span>
              <span className="max-md:ml-4">
                ${displayMoneyWith2Digits(searchInfo.deliveryDetails.dropOff.priceInUsd)}
              </span>
            </div>

            <div className="flex justify-between md:grid md:grid-cols-2">
              <span>{t_comp("taxes")}</span>
              <span className="max-md:ml-4">${displayMoneyWith2Digits(searchInfo.taxes)}</span>
            </div>

            <div className="flex justify-between md:grid md:grid-cols-2">
              <span>{t_comp("deposit")}</span>
              <span className="max-md:ml-4">${displayMoneyWith2Digits(searchInfo.securityDeposit)}</span>
            </div>

            {isDisplayInsurance && (
              <div className="flex justify-between md:grid md:grid-cols-2">
                <span>
                  <Image src={getImageForMenu(MenuIcons.Insurance)} width={20} height={20} alt="" />
                </span>
                <span className="max-md:ml-4">${displayMoneyWith2Digits(insurancePriceTotal)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-around">
          <AboutCarIcon image={carSeatsIcon} text={`${searchInfo.seatsNumber} ${t_comp("seats")}`} />
          <AboutCarIcon
            image={getEngineTypeIcon(searchInfo.engineType)}
            width={50}
            text={getEngineTypeString(searchInfo.engineType)}
          />
          <AboutCarIcon image={carTransmissionIcon} text={searchInfo.transmission} />
        </div>
        <div className="mt-6 flex w-full max-sm:flex-col">
          <RntInputTransparent
            className="mr-2 w-full sm:w-[35%]"
            style={{ color: "white" }}
            inputClassName="text-center"
            type="text"
            placeholder="Promo Code"
            {...register("enteredPromo", {
              onChange: (e) => {
                dispatch({ type: PromoActionType.RESET });

                const value = e.target.value;
                if (value !== undefined && typeof value === "string" && value.length >= PROMOCODE_MAX_LENGTH) {
                  handleSubmit(async (data) => await onFormSubmit(data))();
                }
              },
            })}
          />
          <RntButton
            className="w-full text-base max-sm:mt-4 sm:w-[65%]"
            onClick={() => handleRentCarRequest(searchInfo, state.status === "SUCCESS" ? state.promo.code : undefined)}
            disabled={disableButton || state.status === "LOADING"}
          >
            {state.status === "SUCCESS"
              ? t("promo.button_promo_text", {
                  price: displayMoneyWith2Digits(
                    getPromoPrice(getDiscountablePriceFromCarInfo(searchInfo), state.promo.value) +
                      getNotDiscountablePriceFromCarInfo(searchInfo)
                  ),
                })
              : t("promo.button_default_text", {
                  days: searchInfo.tripDays,
                  price: displayMoneyWith2Digits(
                    getDiscountablePriceFromCarInfo(searchInfo) + getNotDiscountablePriceFromCarInfo(searchInfo)
                  ),
                })}
          </RntButton>
        </div>
      </div>
    </div>
  );
}
