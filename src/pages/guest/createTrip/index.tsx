import RntButton from "@/components/common/rntButton";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import { useTranslation } from "react-i18next";
import { TransmissionType } from "@/model/Transmission";
import useCarSearchParams, { createQueryString } from "@/hooks/guest/useCarSearchParams";
import useCreateTripRequest from "@/hooks/guest/useCreateTripRequest";
import useSearchCar from "@/hooks/guest/useSearchCar";
import { CarPhotos } from "@/components/createTrip/CarPhotos";
import { CarTitleAndPrices } from "@/components/createTrip/CarTitleAndPrices";
import { AboutCar } from "@/components/createTrip/AboutCar";
import { TripConditions } from "@/components/createTrip/TripConditions";
import { CreateTripDiscounts } from "@/components/createTrip/CreateTripDiscounts";
import { CreateTripHostedBy } from "@/components/createTrip/CreateTripHostedBy";
import { CreateTripSearch } from "@/components/createTrip/CreateTripSearch";
import { CreateTripGuestInsurance } from "@/components/createTrip/CreateTripGuestInsurance";
import { PreReceiptDetails } from "@/components/createTrip/PreReceiptDetails";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth/authContext";
import { useRntDialogs, useRntSnackbars } from "@/contexts/rntDialogsContext";
import { isEmpty } from "@/utils/string";
import { DialogActions } from "@/utils/dialogActions";
import { useUserInfo } from "@/contexts/userInfoContext";
import React, { useReducer, useState } from "react";
import RntTripRulesModal from "@/components/common/rntTripRulesModal";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import RntSuspense from "@/components/common/rntSuspense";
import { SearchCarInfoDetails } from "@/model/SearchCarsResult";
import { SearchCarFilters, SearchCarRequest } from "@/model/SearchCarRequest";
import { getDiscountablePriceFromCarInfo, getNotDiscountablePriceFromCarInfo } from "@/utils/price";
import { EMPTY_PROMOCODE, PROMOCODE_MAX_LENGTH } from "@/utils/constants";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import useCheckPromo from "@/features/promocodes/hooks/useCheckPromo";
import { useForm } from "react-hook-form";
import { enterPromoFormSchema, EnterPromoFormValues } from "@/features/promocodes/models/enterPromoFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PromoActionType, promoCodeReducer } from "@/features/promocodes/utils/promoCodeReducer";
import { getPromoPrice } from "@/features/promocodes/utils";

export default function CreateTrip() {
  const { searchCarRequest, searchCarFilters } = useCarSearchParams();
  const { isLoading, carInfo } = useSearchCar(searchCarRequest, searchCarFilters.carId);

  return (
    <CheckingLoadingAuth>
      <RntSuspense isLoading={isLoading}>
        {!carInfo && <p>Car is not found</p>}
        {carInfo && (
          <CreateTripDetailsContent
            carInfo={carInfo}
            searchCarRequest={searchCarRequest}
            searchCarFilters={searchCarFilters}
          />
        )}
      </RntSuspense>
    </CheckingLoadingAuth>
  );
}

function CreateTripDetailsContent({
  carInfo,
  searchCarRequest,
  searchCarFilters,
}: {
  carInfo: SearchCarInfoDetails;
  searchCarRequest: SearchCarRequest;
  searchCarFilters: SearchCarFilters;
}) {
  const router = useRouter();
  const { createTripRequest } = useCreateTripRequest();
  const userInfo = useUserInfo();
  const { isAuthenticated, login } = useAuth();
  const { showDialog, showCustomDialog, hideDialogs } = useRntDialogs();
  const { showInfo, showError, hideSnackbars } = useRntSnackbars();
  const [requestSending, setRequestSending] = useState<boolean>(false);
  const { t } = useTranslation();

  function handleBackToSearchClick() {
    router.push(`/guest/search?${createQueryString(searchCarRequest, searchCarFilters)}`);
  }

  function handlePreAgreementDetailsClick() {
    alert("TODO handlePreAgreementDetailsClick");
  }

  async function createTripWithPromo(promoCode?: string) {
    if (!isAuthenticated) {
      const action = (
        <>
          {DialogActions.Button(t("common.info.login"), () => {
            hideDialogs();
            login();
          })}
          {/*{DialogActions.Cancel(hideDialogs)}*/}
        </>
      );
      showDialog(t("common.info.connect_wallet"), action);
      return;
    }

    if (isEmpty(searchCarRequest.dateFromInDateTimeStringFormat)) {
      showError(t("search_page.errors.date_from"));
      return;
    }
    if (isEmpty(searchCarRequest.dateToInDateTimeStringFormat)) {
      showError(t("search_page.errors.date_to"));
      return;
    }
    if (!carInfo) {
      showError("car is not found");
      return;
    }

    if (carInfo?.tripDays < 0) {
      showError(t("search_page.errors.date_eq"));
      return;
    }
    if (carInfo.ownerAddress === userInfo?.address) {
      showError(t("search_page.errors.own_car"));
      return;
    }

    setRequestSending(true);

    showInfo(t("common.info.sign"));

    promoCode = !isEmpty(promoCode) ? promoCode! : EMPTY_PROMOCODE;
    const result = await createTripRequest(carInfo.carId, searchCarRequest, carInfo.timeZoneId, promoCode);

    hideDialogs();
    hideSnackbars();
    setRequestSending(false);

    if (result.ok) {
      router.push("/guest/trips");
    } else {
      if (result.error === "NOT_ENOUGH_FUNDS") {
        showError(t("common.add_fund_to_wallet"));
      } else {
        showError(t("search_page.errors.request"));
      }
    }
  }

  const [state, dispatch] = useReducer(promoCodeReducer, { status: "NONE" });
  const { checkPromo } = useCheckPromo();
  const { register, handleSubmit, formState } = useForm<EnterPromoFormValues>({
    resolver: zodResolver(enterPromoFormSchema),
  });
  const { errors, isSubmitting } = formState;

  async function onFormSubmit(formData: EnterPromoFormValues) {
    dispatch({ type: PromoActionType.LOADING });

    const result = await checkPromo(
      formData.enteredPromo,
      searchCarRequest.dateFromInDateTimeStringFormat,
      searchCarRequest.dateToInDateTimeStringFormat,
      carInfo.timeZoneId
    );

    if (!result.ok) {
      dispatch({ type: PromoActionType.ERROR });
    } else {
      dispatch({ type: PromoActionType.SUCCESS, payload: { code: formData.enteredPromo, value: result.value.value } });
    }
  }

  return (
    <div className="flex flex-wrap">
      <div className="flex w-full flex-col gap-4 xl:w-3/4 xl:pr-4">
        <CarPhotos carPhotos={carInfo.images} />
        <CarTitleAndPrices
          carTitle={`${carInfo.brand} ${carInfo.model} ${carInfo.year}`}
          pricePerDay={carInfo.pricePerDay}
          pricePerDayWithHostDiscount={carInfo.pricePerDayWithHostDiscount}
          tripDays={carInfo.tripDays}
          tripDiscounts={carInfo.tripDiscounts}
        />
        <AboutCar
          carName={carInfo.carName}
          doorsNumber={carInfo.doorsNumber}
          seatsNumber={Number(carInfo.seatsNumber)}
          engineType={carInfo.engineType}
          transmission={carInfo.transmission as TransmissionType}
          tankSizeInGal={carInfo.tankSizeInGal}
          carColor={carInfo.color}
          carDescription={carInfo.carDescription}
        />
        <hr />
        <TripConditions
          pricePerDay={carInfo.pricePerDay}
          securityDeposit={carInfo.securityDeposit}
          milesIncludedPerDay={Number(carInfo.milesIncludedPerDayText)}
          pricePer10PercentFuel={carInfo.pricePer10PercentFuel}
          deliveryPrices={carInfo.deliveryPrices}
          insuranceDetails={{
            isInsuranceRequired: carInfo.isInsuranceRequired,
            insurancePerDayPriceInUsd: carInfo.insurancePerDayPriceInUsd,
            isGuestHasInsurance: carInfo.isGuestHasInsurance,
          }}
        />
        <hr />
        <CreateTripDiscounts tripDiscounts={carInfo.tripDiscounts} />
        <hr />
        <div className="grid w-full grid-cols-2 gap-8">
          <RntTripRulesModal buttonClassName="w-full" />
          <RntButtonTransparent
            className="w-full text-lg text-rentality-secondary"
            disabled={true}
            onClick={handlePreAgreementDetailsClick}
          >
            {t("create_trip.pre_agreement_details")}
          </RntButtonTransparent>
        </div>
        <CreateTripHostedBy
          hostPhotoUrl={carInfo.hostPhotoUrl}
          hostName={carInfo.hostName}
          hostAddress={carInfo.hostHomeLocation}
        />
      </div>
      <div className="mt-8 flex w-full flex-col gap-4 xl:mt-0 xl:w-1/4 xl:pl-4">
        <CreateTripSearch
          searchRequest={searchCarRequest}
          hostHomeLocation={carInfo.hostHomeLocation}
          deliveryDetails={carInfo.deliveryDetails}
          timeZoneId={carInfo.timeZoneId}
        />
        <CreateTripGuestInsurance
          insuranceDetails={{
            isInsuranceRequired: carInfo.isInsuranceRequired,
            insurancePerDayPriceInUsd: carInfo.insurancePerDayPriceInUsd,
            isGuestHasInsurance: carInfo.isGuestHasInsurance,
          }}
        />
        <PreReceiptDetails
          pricePerDay={carInfo.pricePerDay}
          pricePerDayWithHostDiscount={carInfo.pricePerDayWithHostDiscount}
          tripDays={carInfo.tripDays}
          deliveryDetails={carInfo.deliveryDetails}
          salesTax={carInfo.salesTax}
          governmentTax={carInfo.governmentTax}
          securityDeposit={carInfo.securityDeposit}
          insuranceDetails={{
            isInsuranceRequired: carInfo.isInsuranceRequired,
            insurancePerDayPriceInUsd: carInfo.insurancePerDayPriceInUsd,
            isGuestHasInsurance: carInfo.isGuestHasInsurance,
          }}
        />
        <RntInputTransparent
          className="mt-4 w-full"
          style={{ color: "white" }}
          type="text"
          placeholder={t("promo.input_hint")}
          {...register("enteredPromo", {
            onChange: (e) => {
              dispatch({ type: PromoActionType.RESET });

              const value = e.target.value;
              if (value !== undefined && typeof value === "string" && value.length >= PROMOCODE_MAX_LENGTH) {
                handleSubmit(async (data) => await onFormSubmit(data))();
              }
            },
          })}
          validationError={errors.enteredPromo?.message}
        />
        <div>
          {state.status === "SUCCESS" && (
            <>
              <p>{t("promo.promo_success_1", { value: state.promo.value })}</p>
              <p className="text-sm">{t("promo.promo_success_2")}</p>
            </>
          )}
          {state.status === "ERROR" && <p className="text-rentality-alert-text">{t("promo.promo_error")}</p>}
        </div>
        <RntButton
          className="w-full"
          disabled={requestSending || state.status === "LOADING"}
          onClick={() => createTripWithPromo(state.status === "SUCCESS" ? state.promo.code : undefined)}
        >
          {state.status === "SUCCESS"
            ? t("promo.button_promo_text", {
                price: displayMoneyWith2Digits(
                  getPromoPrice(getDiscountablePriceFromCarInfo(carInfo), state.promo.value) +
                    getNotDiscountablePriceFromCarInfo(carInfo)
                ),
              })
            : t("promo.button_default_text", {
                days: carInfo.tripDays,
                price: displayMoneyWith2Digits(
                  getDiscountablePriceFromCarInfo(carInfo) + getNotDiscountablePriceFromCarInfo(carInfo)
                ),
              })}
        </RntButton>
      </div>
    </div>
  );
}
