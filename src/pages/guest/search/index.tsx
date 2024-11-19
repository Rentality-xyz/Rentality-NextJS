import CarSearchItem from "@/components/guest/carSearchItem";
import useSearchCars from "@/hooks/guest/useSearchCars";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { SearchCarInfo } from "@/model/SearchCarsResult";
import { useRntDialogs, useRntSnackbars } from "@/contexts/rntDialogsContext";
import { useUserInfo } from "@/contexts/userInfoContext";
import { isEmpty } from "@/utils/string";
import { DialogActions } from "@/utils/dialogActions";
import CarSearchMap from "@/components/guest/carMap/carSearchMap";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/utils/i18n";
import Image from "next/image";
import icMapMobile from "@/images/ic_map_mobile.png";
import SearchAndFilters from "@/components/search/searchAndFilters";
import { useAuth } from "@/contexts/auth/authContext";
import useCarSearchParams, { createQueryString } from "@/hooks/guest/useCarSearchParams";
import { SearchCarFilters, SearchCarRequest } from "@/model/SearchCarRequest";
import useCreateTripRequest from "@/hooks/guest/useCreateTripRequest";
import { env } from "@/utils/env";
import { APIProvider } from "@vis.gl/react-google-maps";
import mapNotFoundCars from "@/images/map_not_found_cars.png";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import Loading from "@/components/common/Loading";
import RntSuspense from "@/components/common/rntSuspense";

export default function Search() {
  const { searchCarRequest, searchCarFilters, updateSearchParams } = useCarSearchParams();

  const [isLoading, searchAvailableCars, searchResult, sortSearchResult, setSearchResult] = useSearchCars();
  const { createTripRequest } = useCreateTripRequest();

  const [requestSending, setRequestSending] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const { showDialog, hideDialogs } = useRntDialogs();
  const { showInfo, showError, hideSnackbars } = useRntSnackbars();
  const userInfo = useUserInfo();
  const router = useRouter();
  const { isLoadingAuth, isAuthenticated, login } = useAuth();
  const ethereumInfo = useEthereum();
  const { t } = useTranslation();

  const t_page: TFunction = (path, options) => {
    return t("search_page." + path, options);
  };

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

  const handleRentCarRequest = async (carInfo: SearchCarInfo) => {
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
      showError(t("errors.user_info"));
      await router.push("/guest/profile");
      return;
    }

    if (isEmpty(searchResult.searchCarRequest.dateFromInDateTimeStringFormat)) {
      showError(t("errors.date_from"));
      return;
    }
    if (isEmpty(searchResult.searchCarRequest.dateToInDateTimeStringFormat)) {
      showError(t("errors.date_to"));
      return;
    }

    if (carInfo.tripDays < 0) {
      showError(t("errors.date_eq"));
      return;
    }
    if (carInfo.ownerAddress === userInfo?.address) {
      showError(t("errors.own_car"));
      return;
    }

    setRequestSending(true);

    showInfo(t("common.info.sign"));

    const result = await createTripRequest(carInfo.carId, searchResult.searchCarRequest, carInfo.timeZoneId);

    hideDialogs();
    hideSnackbars();
    setRequestSending(false);

    if (result.ok) {
      router.push("/guest/trips");
    } else {
      if (result.error === "NOT_ENOUGH_FUNDS") {
        showError(t("common.add_fund_to_wallet"));
      } else {
        showError(t("errors.request"));
      }
    }
  };

  function handleShowRequestDetails(carInfo: SearchCarInfo) {
    router.push(`/guest/createTrip?${createQueryString(searchCarRequest, searchCarFilters, carInfo.carId)}`);
  }

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

  useEffect(() => {
    if (sortBy === undefined) return;
    sortSearchResult(sortBy);
  }, [sortBy, sortSearchResult]);

  const [isExpanded, setIsExpanded] = useState(false);

  const handleArrowClick = () => {
    setIsExpanded(!isExpanded);
  };

  if (isLoadingAuth || (isAuthenticated && ethereumInfo === undefined)) {
    return <Loading />;
  }

  return (
    <APIProvider apiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={["maps", "marker", "places"]} language="en">
      <div className="flex flex-col" title="Search">
        <SearchAndFilters
          initValue={searchCarRequest}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onSearchClick={handleSearchClick}
          onFilterApply={handleFilterApply}
          filterLimits={searchResult.filterLimits}
          t={t}
        />
        <div className="flex gap-3 max-xl:flex-col-reverse">
          <div className="my-4 flex flex-col gap-4 xl:w-8/12 2xl:w-7/12 fullHD:w-6/12">
            <RntSuspense
              isLoading={isLoading || isLoadingAuth || (isAuthenticated && ethereumInfo === undefined)}
              fallback={<div className="pl-[18px]">{t("common.info.loading")}</div>}
            >
              <div className="text-l pl-[18px] font-bold">
                {searchResult?.carInfos?.length ?? 0} {t_page("info.cars_available")}
              </div>
              {searchResult?.carInfos?.length > 0 ? (
                searchResult.carInfos.map((value: SearchCarInfo) => {
                  return (
                    <div key={value.carId} id={`car-${value.carId}`}>
                      <CarSearchItem
                        key={value.carId}
                        searchInfo={value}
                        handleRentCarRequest={handleRentCarRequest}
                        disableButton={requestSending}
                        isSelected={value.highlighted}
                        setSelected={setHighlightedCar}
                        t={t_page}
                        handleShowRequestDetails={handleShowRequestDetails}
                      />
                    </div>
                  );
                })
              ) : (
                <div>
                  <div className="flex max-w-screen-xl flex-col border border-gray-600 p-2 text-center font-['Montserrat',Arial,sans-serif] text-white">
                    {/*{t_page("info.no_cars")}*/}
                    <p className="text-3xl">{t_page("info.launched_miami")}</p>
                    <p className="mt-4 text-2xl text-rentality-secondary">{t_page("info.soon_other_locations")}</p>
                    <p className="mt-4 text-base">{t_page("info.changing_request")}</p>
                  </div>
                  <Image src={mapNotFoundCars} alt="" className="mt-2" />
                </div>
              )}
            </RntSuspense>
            {}
          </div>
          <div className="my-4 max-xl:mb-8 xl:w-4/12 2xl:w-5/12 fullHD:w-6/12">
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
            <div
              className="absolute left-1/2 flex -translate-x-1/2 cursor-pointer xl:hidden"
              onClick={handleArrowClick}
            >
              <Image src={icMapMobile} alt="" className={`h-[48px] w-[48px]`} />
            </div>
          </div>
        </div>
      </div>
    </APIProvider>
  );
}
