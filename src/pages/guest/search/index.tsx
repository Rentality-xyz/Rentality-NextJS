import CarSearchItem from "@/components/guest/carSearchItem";
import useSearchCars from "@/hooks/guest/useSearchCars";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { SearchCarInfo, UserCurrencyDTO } from "@/model/SearchCarsResult";
import { useRntDialogs, useRntSnackbars } from "@/contexts/rntDialogsContext";
import { useUserInfo } from "@/contexts/userInfoContext";
import { isEmpty } from "@/utils/string";
import { DialogActions } from "@/utils/dialogActions";
import CarSearchMap from "@/components/guest/carMap/carSearchMap";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import SearchAndFilters from "@/components/search/searchAndFilters";
import { useAuth } from "@/contexts/auth/authContext";
import useCarSearchParams, { createQueryString } from "@/hooks/guest/useCarSearchParams";
import { SearchCarFilters, SearchCarRequest } from "@/model/SearchCarRequest";
import useCreateTripRequest from "@/hooks/guest/useCreateTripRequest";
import { env } from "@/utils/env";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import Loading from "@/components/common/Loading";
import RntSuspense from "@/components/common/rntSuspense";
import { EMPTY_PROMOCODE } from "@/utils/constants";
import useFetchGuestGeneralInsurance from "@/features/insurance/hooks/useFetchGuestGeneralInsurance";
import useBlockchainNetworkCheck from "@/features/blockchain/hooks/useBlockchainNetworkCheck";
import getNetworkName from "@/model/utils/NetworkName";
import bs58 from "bs58";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import RntSelect from "@/components/common/rntSelect";
import { useRentality } from "@/contexts/rentalityContext";
import RntFilterSelect from "@/components/common/RntFilterSelect";
import { ContractAllowedCurrencyDTO } from "@/model/blockchain/schemas";
import { flushSync } from "react-dom";
import { SelectCurrencyDialogForm } from "@/components/createTrip/SelectCurrencyDialogForm";
import RntButton from "@/components/common/rntButton";

function Search() {
  const { searchCarRequest, searchCarFilters, updateSearchParams } = useCarSearchParams();

  const [isLoading, searchAvailableCars, searchResult, sortBy, setSortBy, setSearchResult] = useSearchCars();
  const { createTripRequest } = useCreateTripRequest();
  const { rentalityContracts } = useRentality();

  const [requestSending, setRequestSending] = useState<boolean>(false);
  const { showDialog, hideDialogs, showCustomDialog } = useRntDialogs();
  const { showInfo, showError, showSuccess, hideSnackbars } = useRntSnackbars();
  const userInfo = useUserInfo();
  const router = useRouter();
  const { isLoadingAuth, isAuthenticated, login } = useAuth();
  const ethereumInfo = useEthereum();
  const { isLoading: isLoadingInsurance, data: guestInsurance } = useFetchGuestGeneralInsurance();
  useBlockchainNetworkCheck();
  const { t } = useTranslation();

  const handleSearchClick = async (request: SearchCarRequest) => {
    updateSearchParams(request, searchCarFilters);
    searchAvailableCars(request, searchCarFilters);
  };

  const handleFilterApply = async (filters: SearchCarFilters) => {
    updateSearchParams(searchCarRequest, filters);
    searchAvailableCars(searchCarRequest, filters);
  };

  useEffect(() => {
    searchAvailableCars(searchCarRequest, searchCarFilters);
  }, []);

  async function createTripWithPromo(carInfo: SearchCarInfo, totalPrice: number, promoCode?: string) {
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

    if (isEmpty(searchResult.searchCarRequest.dateFromInDateTimeStringFormat)) {
      showError(t("search_page.errors.date_from"));
      return;
    }
    if (isEmpty(searchResult.searchCarRequest.dateToInDateTimeStringFormat)) {
      showError(t("search_page.errors.date_to"));
      return;
    }

    if (carInfo.tripDays < 0) {
      showError(t("search_page.errors.date_eq"));
      return;
    }
    if (carInfo.ownerAddress === userInfo?.address) {
      showError(t("search_page.errors.own_car"));
      return;
    }
    if (!rentalityContracts) {
      return;
    }   

    const hasFounds = ethereumInfo && await isUserHasEnoughFunds(ethereumInfo.signer, totalPrice, carInfo.currency);
  
    if (!hasFounds) {
      const currenciesResult = await rentalityContracts.gateway.getAvailableCurrency();
      if (!currenciesResult.ok || currenciesResult.value.length === 0) {
        showError(t("search_page.errors.available_cur_error"));
        return;
      }
   
      if (!currenciesResult.ok || currenciesResult.value.length === 0) {
        showError(t("search_page.errors.available_cur_error"));
        return;
      }

      showCustomDialog(
        <SelectCurrencyDialogForm
          currencies={currenciesResult.value}
          createTripHandler={(paymentCurrency) => { createTip(paymentCurrency, promoCode, carInfo)}}
          hideDialogHandler={hideDialogs}
        />
      );
      return;
    }

    await createTip(carInfo.currency.currency, promoCode, carInfo);
  }

  const createTip = async (paymentCurrency: string, promoCode: string | undefined, carInfo: SearchCarInfo) => {
    setRequestSending(true);

    showInfo(t("common.info.sign"));

    promoCode = !isEmpty(promoCode) ? promoCode! : EMPTY_PROMOCODE;
    const result = await createTripRequest(
      carInfo.carId,
      searchResult.searchCarRequest,
      carInfo.timeZoneId,
      promoCode,
      carInfo.currency,
      paymentCurrency
    );

    hideDialogs();
    hideSnackbars();
    setRequestSending(false);

    if (result.ok) {
      showSuccess(t("search_page.car_search_item.booked"));
      router.push("/guest/trips");
    } else {
      if (result.error.message === "NOT_ENOUGH_FUNDS") {
        showError(
          t("common.add_fund_to_wallet", {
            network: getNetworkName(ethereumInfo),
          })
        );
      } else {
        showError(t("search_page.errors.request"));
      }
    }
  };

  const getRequestDetailsLink = (carInfo: SearchCarInfo) => {
    const data = {
      carInfo,
      searchCarFilters,
      searchCarRequest,
    };
    const jsonString = JSON.stringify(data, (_key, value) => (typeof value === "bigint" ? value.toString() : value));

    const uint8array = new TextEncoder().encode(jsonString);

    const encoded = bs58.encode(uint8array);

    return `/guest/createTrip?data=${encoded}`;
  };
  const setHighlightedCar = useCallback(
    (carID: number) => {
      setSearchResult((prev) => {
        const newSearchResult = { ...prev };

        newSearchResult.carInfos.forEach((item: SearchCarInfo) => {
          item.highlighted = item.carId == carID;
        });
        return newSearchResult;
      });
    },
    [setSearchResult]
  );

  const sortCars = useCallback(
    (selectedCarId: number) => {
      setSearchResult((prev) => {
        const newSearchResult = { ...prev };

        const selectedCarIndex = newSearchResult.carInfos.findIndex((car) => car.carId === selectedCarId);

        if (selectedCarIndex !== -1) {
          setTimeout(() => {
            document.getElementById(`car-${selectedCarId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 0);
        }

        return newSearchResult;
      });
    },
    [setSearchResult]
  );

  const [isExpanded, setIsExpanded] = useState(false);

  const handleArrowClick = () => {
    setIsExpanded(!isExpanded);
  };

  if (isLoadingAuth || (isAuthenticated && ethereumInfo === undefined)) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col" title="Search">
      <SearchAndFilters
        defaultSearchCarFilters={searchCarFilters}
        initValue={searchCarRequest}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onSearchClick={handleSearchClick}
        onFilterApply={handleFilterApply}
        filterLimits={searchResult.filterLimits}
        t={t}
      />
      <div className="flex gap-3 max-2xl:flex-col-reverse">
        <div className="my-4 flex flex-col gap-4 2xl:w-7/12 fullHD:w-6/12">
          <RntSuspense
            isLoading={isLoading || isLoadingAuth || (isAuthenticated && ethereumInfo === undefined)}
            fallback={<div className="pl-[18px]">{t("common.info.loading")}</div>}
          >
            <div className="text-l pl-[18px] font-bold">
              {searchResult?.carInfos?.length ?? 0} {t("search_page.info.cars_available")}
            </div>
            {searchResult?.carInfos?.length > 0 ? (
              searchResult.carInfos.map((value: SearchCarInfo) => {

                return (
                  <div key={value.carId} id={`car-${value.carId}`}>
                    <CarSearchItem
                      key={value.carId}
                      searchInfo={value}
                      handleRentCarRequest={() => createTripWithPromo(value, value.priceInCurrency)}
                      disableButton={requestSending}
                      isSelected={value.highlighted}
                      setSelected={setHighlightedCar}
                      getRequestDetailsLink={() => getRequestDetailsLink(value)}
                      isGuestHasInsurance={!isLoadingInsurance && !isEmpty(guestInsurance.photo)}
                      isYourOwnCar={userInfo?.address === value.ownerAddress}
                      startDateTimeStringFormat={searchResult.searchCarRequest.dateFromInDateTimeStringFormat}
                      endDateTimeStringFormat={searchResult.searchCarRequest.dateToInDateTimeStringFormat}
                    />
                  </div>
                );
              })
            ) : (
              <div>
                <div className="flex max-w-screen-xl flex-col border border-gray-600 p-2 text-center font-['Montserrat',Arial,sans-serif] text-white items-center">
                  <p className="text-3xl">{t("search_page.info.no_cars_in_state", {state: searchCarRequest.searchLocation.state})}</p>
                  <p className="mt-4 text-2xl text-rentality-secondary">{t("search_page.info.try_another_location")}</p>
                  <p className="mt-4 text-base">{t("search_page.info.own_car", {state: searchCarRequest.searchLocation.state})}</p>
                  <RntButton
                    className="mt-4 mb-4"
                    onClick={() => {router.push("/host/become_host")}}
                  >
                    {t("search_page.info.list_your_car")}
                  </RntButton>
                </div>
                <Image src={"/images/map_not_found_cars.png"} width={2912} height={1632} alt="" className="mt-2" />
              </div>
            )}
          </RntSuspense>
          {}
        </div>
        <div className="my-4 max-2xl:mb-8 2xl:w-5/12 fullHD:w-6/12">
          <CarSearchMap
            searchResult={searchResult}
            setSelected={(carID: number) => {
              setHighlightedCar(carID);
              sortCars(carID);
            }}
            isExpanded={isExpanded}
            defaultCenter={
              searchCarRequest.searchLocation.latitude &&
              searchCarRequest.searchLocation.longitude &&
              searchCarRequest.searchLocation.latitude > 0 &&
              searchCarRequest.searchLocation.longitude > 0
                ? { lat: searchCarRequest.searchLocation.latitude, lng: searchCarRequest.searchLocation.longitude }
                : null
            }
          />
          <div className="absolute left-1/2 flex -translate-x-1/2 cursor-pointer 2xl:hidden" onClick={handleArrowClick}>
            <Image
              src={"/images/icons/ic_map_mobile.png"}
              width={100}
              height={100}
              alt=""
              className={`h-[48px] w-[48px]`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

Search.allowAnonymousAccess = true;

export default Search;
