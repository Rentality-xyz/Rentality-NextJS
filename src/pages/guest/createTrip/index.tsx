import RntButton from "@/components/common/rntButton";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import { useTranslation } from "react-i18next";
import { TransmissionType } from "@/model/Transmission";
import useCarSearchParams, { createQueryString } from "@/hooks/guest/useCarSearchParams";
import useCreateTripRequest from "@/hooks/guest/useCreateTripRequest";
import useSearchCar from "@/hooks/guest/useSearchCar";
import Loading from "@/components/common/Loading";
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
import { useState } from "react";
import RntTripRulesModal from "@/components/common/rntTripRulesModal";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import RntSuspense from "@/components/common/rntSuspense";
import { SearchCarInfoDetails } from "@/model/SearchCarsResult";
import { SearchCarFilters, SearchCarRequest } from "@/model/SearchCarRequest";

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
  const { isLoadingAuth, isAuthenticated, login } = useAuth();
  const { showDialog, hideDialogs } = useRntDialogs();
  const { showInfo, showError, hideSnackbars } = useRntSnackbars();
  const [requestSending, setRequestSending] = useState<boolean>(false);
  const { t } = useTranslation();

  function handleBackToSearchClick() {
    router.push(`/guest/search?${createQueryString(searchCarRequest, searchCarFilters)}`);
  }

  function handlePreAgreementDetailsClick() {
    alert("TODO handlePreAgreementDetailsClick");
  }

  async function handeCreateTripClick() {
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

    if (isEmpty(userInfo?.drivingLicense)) {
      showError(t("search_page.errors.user_info"));
      await router.push("/guest/profile");
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

    const result = await createTripRequest(carInfo.carId, searchCarRequest, carInfo.timeZoneId);

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

  return (
    <div className="flex flex-wrap">
      <div className="flex w-full flex-col gap-4 xl:w-3/4 xl:pr-4">
        <CarPhotos carPhotos={carInfo.images} />
        <CarTitleAndPrices
          carTitle={`${carInfo.brand} ${carInfo.model} ${carInfo.year}`}
          pricePerDay={carInfo.pricePerDay}
          pricePerDayWithDiscount={carInfo.pricePerDayWithDiscount}
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
        <div className="mx-auto text-xl font-bold text-rentality-secondary" onClick={handleBackToSearchClick}>
          {t("create_trip.new_search")}
        </div>
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
          pricePerDayWithDiscount={carInfo.pricePerDayWithDiscount}
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
        <RntButton className="h-16 w-full" disabled={requestSending} onClick={handeCreateTripClick}>
          {t("create_trip.rent_for_n_days", { tripDays: carInfo.tripDays })}
        </RntButton>
      </div>
    </div>
  );
}
