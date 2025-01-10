import { SearchCarInfo } from "@/model/SearchCarsResult";
import RntButton from "../common/rntButton";
import { Avatar } from "@mui/material";
import { useState, useEffect } from "react";
import React, { useMemo, useReducer } from "react";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { getEngineTypeIcon, getEngineTypeString } from "@/model/EngineType";
import Image from "next/image";
import MenuIcons, { getImageForMenu } from "../sideNavMenu/menuIcons";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import carSeatsIcon from "@/images/car_seats.svg";
import carTransmissionIcon from "@/images/car_transmission.svg";
import { AboutCarIcon } from "@/components/createTrip/AboutCarIcon";
import { getDiscountablePriceFromCarInfo, getNotDiscountablePrice } from "@/utils/price";
import { PROMOCODE_MAX_LENGTH } from "@/utils/constants";
import { useForm } from "react-hook-form";
import { enterPromoFormSchema, EnterPromoFormValues } from "@/features/promocodes/models/enterPromoFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import useCheckPromo from "@/features/promocodes/hooks/useCheckPromo";
import { cn } from "@/utils";
import { PromoActionType, promoCodeReducer } from "@/features/promocodes/utils/promoCodeReducer";
import { getPromoPrice } from "@/features/promocodes/utils";

type TFunction = (key: string, options?: { [key: string]: any }) => string;

const ccsDivider = "max-md:hidden absolute top-1/2 h-[80%] w-px translate-y-[-50%] bg-gray-500";

export default function CarSearchItem({
  searchInfo,
  handleRentCarRequest,
  disableButton,
  isSelected,
  setSelected,
  isGuestHasInsurance,
  getRequestDetailsLink,
  startDateTimeStringFormat,
  endDateTimeStringFormat,
}: {
  searchInfo: SearchCarInfo;
  handleRentCarRequest: (carInfo: SearchCarInfo, PromoCode?: string) => void;
  disableButton: boolean;
  isSelected: boolean;
  setSelected: (carID: number) => void;
  isGuestHasInsurance: boolean;
  getRequestDetailsLink: (carId: number) => string;
  startDateTimeStringFormat: string;
  endDateTimeStringFormat: string;
}) {
  const [requestDetailsLink, setRequestDetailsLink] = useState<string>("");
  const { t } = useTranslation();

  const t_comp: TFunction = (name, options) => {
    return t("search_page.car_search_item." + name, options);
  };

  const mainClasses = useMemo(() => {
    const classNames = "bg-rentality-bg rnt-card flex flex-col rounded-xl overflow-hidden cursor-pointer";
    return isSelected ? classNames + " border-2" : classNames;
  }, [isSelected]);

  useEffect(() => {
    setRequestDetailsLink(getRequestDetailsLink(searchInfo.carId));
  }, [getRequestDetailsLink, searchInfo]);

  const isDisplayInsurance = searchInfo.isInsuranceRequired && !isGuestHasInsurance;
  const insurancePriceTotal = isDisplayInsurance ? searchInfo.insurancePerDayPriceInUsd * searchInfo.tripDays : 0;

  const [state, dispatch] = useReducer(promoCodeReducer, { status: "NONE" });
  const { checkPromo } = useCheckPromo();
  const { register, handleSubmit } = useForm<EnterPromoFormValues>({
    resolver: zodResolver(enterPromoFormSchema),
  });

  async function onFormSubmit(formData: EnterPromoFormValues) {
    dispatch({ type: PromoActionType.LOADING });

    const result = await checkPromo(
      formData.enteredPromo,
      startDateTimeStringFormat,
      endDateTimeStringFormat,
      searchInfo.timeZoneId
    );

    if (!result.ok) {
      dispatch({ type: PromoActionType.ERROR });
    } else {
      dispatch({ type: PromoActionType.SUCCESS, payload: { code: formData.enteredPromo, value: result.value.value } });
    }
  }

  return (
    <div className={mainClasses}>
      <Link href={requestDetailsLink} target="_blank">
        <div
          style={{ backgroundImage: `url(${searchInfo.images[0]})` }}
          className="relative min-h-[15rem] w-full flex-shrink-0 bg-cover bg-center md:min-h-[20rem]"
        >
          {searchInfo.isCarDetailsConfirmed && (
            <i className="fi fi-br-hexagon-check absolute right-2 top-2 text-3xl text-green-500"></i>
          )}
        </div>
      </Link>
      <div className="flex w-full flex-col justify-between p-2 sm:pb-2 sm:pl-4 sm:pr-2 sm:pt-2">
        <div onClick={() => setSelected(searchInfo.carId)}>
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
          <div className="mt-2 flex w-full flex-col text-sm md:grid md:grid-cols-[40%_1fr_1fr] md:gap-4">
            <div className="relative flex flex-col">
              {isNaN(searchInfo.pricePerDayWithHostDiscount) ||
              searchInfo.pricePerDayWithHostDiscount === searchInfo.pricePerDay ? (
                <div className="text-base">
                  <strong>
                    ${displayMoneyWith2Digits(searchInfo.pricePerDay)}
                    {t_comp("per_day")}
                  </strong>
                </div>
              ) : (
                <div className="text-base">
                  <strong>
                    ${displayMoneyWith2Digits(searchInfo.pricePerDayWithHostDiscount)}
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
                <span className="ml-8">${displayMoneyWith2Digits(searchInfo.totalPriceWithHostDiscount)}</span>
              </div>

              {isDisplayInsurance && <p className="mt-2 text-rentality-secondary">{t_comp("insurance_required")}</p>}
              <div className={cn("right-[10px] fullHD:right-[22px]", ccsDivider)}></div>
            </div>
            <div className="relative flex flex-col justify-between max-md:mt-2">
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
              <div className={cn("right-[2px]", ccsDivider)}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex justify-between max-md:mt-6 max-md:w-full md:h-full md:flex-col">
                <AboutCarIcon
                  className="grid-cols-2 md:grid"
                  image={carSeatsIcon}
                  text={`${searchInfo.seatsNumber} ${t_comp("seats")}`}
                />
                <AboutCarIcon
                  className="grid-cols-2 md:grid"
                  image={getEngineTypeIcon(searchInfo.engineType)}
                  width={50}
                  text={getEngineTypeString(searchInfo.engineType)}
                />
                <AboutCarIcon
                  className="grid-cols-2 md:grid"
                  image={carTransmissionIcon}
                  text={searchInfo.transmission}
                />
              </div>
            </div>
          </div>
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
                      getNotDiscountablePrice(insurancePriceTotal, searchInfo.securityDeposit)
                  ),
                })
              : t("promo.button_default_text", {
                  days: searchInfo.tripDays,
                  price: displayMoneyWith2Digits(
                    getDiscountablePriceFromCarInfo(searchInfo) +
                      getNotDiscountablePrice(insurancePriceTotal, searchInfo.securityDeposit)
                  ),
                })}
          </RntButton>
        </div>
      </div>
    </div>
  );
}
