import CarSearchItem from "@/components/guest/carSearchItem";
import useSearchCars from "@/hooks/guest/useSearchCars";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { SearchCarInfo } from "@/model/SearchCarsResult";
import { useRntDialogs, useRntSnackbars } from "@/contexts/rntDialogsContext";
import { useUserInfo } from "@/contexts/userInfoContext";
import { isEmpty } from "@/utils/string";
import { DialogActions } from "@/utils/dialogActions";
import { GoogleMapsProvider } from "@/contexts/googleMapsContext";
import CarSearchMap from "@/components/guest/carMap/carSearchMap";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/utils/i18n";
import Image from "next/image";
import mapArrow from "@/images/arrUpBtn.png";
import FilterSlidingPanel from "@/components/search/filterSlidingPanel";
import SearchAndFilters from "@/components/search/searchAndFilters";
import { useAuth } from "@/contexts/auth/authContext";
import useCarSearchParams from "@/hooks/guest/useCarSearchParams";
import { SearchCarFilters, SearchCarRequest } from "@/model/SearchCarRequest";

export default function Search() {
  const { searchCarRequest, searchCarFilters, updateSearchParams } = useCarSearchParams();
  const [isLoading, searchAvailableCars, searchResult, sortSearchResult, createTripRequest, setSearchResult] =
    useSearchCars();

  const [requestSending, setRequestSending] = useState<boolean>(false);
  const [openFilterPanel, setOpenFilterPanel] = useState(false);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const { showDialog, hideDialogs } = useRntDialogs();
  const { showInfo, showError, hideSnackbars } = useRntSnackbars();
  const userInfo = useUserInfo();
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const { t } = useTranslation();

  const t_page: TFunction = (path, options) => {
    return t("search_page." + path, options);
  };
  const t_errors: TFunction = (name, options) => {
    return t_page("errors." + name, options);
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
          {DialogActions.Cancel(hideDialogs)}
        </>
      );
      showDialog(t("common.info.connect_wallet"), action);
      return;
    }

    try {
      if (isEmpty(userInfo?.drivingLicense)) {
        showError(t_errors("user_info"));
        await router.push("/guest/profile");
        return;
      }

      if (searchResult.searchCarRequest.dateFrom == null) {
        showError(t_errors("date_from"));
        return;
      }
      if (searchResult.searchCarRequest.dateTo == null) {
        showError(t_errors("date_to"));
        return;
      }

      if (carInfo.tripDays < 0) {
        showError(t_errors("date_eq"));
        return;
      }
      if (carInfo.ownerAddress === userInfo?.address) {
        showError(t_errors("own_car"));
        return;
      }

      setRequestSending(true);

      showInfo(t("common.info.sign"));
      const result = await createTripRequest(carInfo.carId, searchResult.searchCarRequest, carInfo.timeZoneId);

      setRequestSending(false);
      hideDialogs();
      hideSnackbars();
      if (!result) {
        showError(t_errors("request"));
        return;
      }
      router.push("/guest/trips");
    } catch (e) {
      showError(t_errors("request"));
      console.error("sendRentCarRequest error:" + e);

      setRequestSending(false);
    }
  };

  const setHighlightedCar = useCallback(
    (carID: number) => {
      const newSearchResult = { ...searchResult };

      newSearchResult.carInfos.forEach((item: SearchCarInfo) => {
        item.highlighted = item.carId == carID;
      });

      setSearchResult(newSearchResult);
    },
    [searchResult]
  );

  const sortCars = useCallback(() => {
    const newSearchResult = { ...searchResult };

    newSearchResult.carInfos.sort((a: SearchCarInfo, b: SearchCarInfo) => {
      if (a.highlighted && !b.highlighted) {
        return -1;
      } else if (!a.highlighted && b.highlighted) {
        return 1;
      } else {
        return 0;
      }
    });

    setSearchResult(newSearchResult);
  }, [searchResult]);

  useEffect(() => {
    if (sortBy === undefined) return;
    sortSearchResult(sortBy);
  }, [sortBy, sortSearchResult]);

  const [isExpanded, setIsExpanded] = useState(false);

  const handleArrowClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <GoogleMapsProvider libraries={["maps", "marker", "places"]} language="en">
        <div className="flex flex-col" title="Search">
          <SearchAndFilters
            initValue={searchCarRequest}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onSearchClick={handleSearchClick}
            onOpenFilters={() => {
              setOpenFilterPanel(true);
            }}
            t={t}
          />
          <div className="mb-8 flex flex-row"></div>

          <div className="flex gap-3 max-xl:flex-col-reverse">
            <div className="my-4 flex flex-col gap-4 xl:w-8/12 2xl:w-7/12 fullHD:w-6/12">
              {isLoading ? (
                <div className="pl-[18px]">Loading...</div>
              ) : (
                <>
                  <div className="text-l pl-[18px] font-bold">
                    {searchResult?.carInfos?.length ?? 0} {t_page("info.cars_available")}
                  </div>
                  {searchResult?.carInfos?.length > 0 ? (
                    searchResult.carInfos.map((value: SearchCarInfo) => {
                      return (
                        <CarSearchItem
                          key={value.carId}
                          searchInfo={value}
                          handleRentCarRequest={handleRentCarRequest}
                          disableButton={requestSending}
                          isSelected={value.highlighted}
                          setSelected={setHighlightedCar}
                          t={t_page}
                        />
                      );
                    })
                  ) : (
                    <div className="flex max-w-screen-xl flex-wrap justify-between pl-[18px] text-center xl:h-full">
                      {t_page("info.no_cars")}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="my-4 max-xl:mb-8 xl:w-4/12 2xl:w-5/12 fullHD:w-6/12">
              <CarSearchMap
                searchResult={searchResult}
                setSelected={(carID: number) => {
                  setHighlightedCar(carID);
                  sortCars();
                }}
                isExpanded={isExpanded}
                defaultCenter={
                  searchCarRequest.searchLocation.latitude &&
                  searchCarRequest.searchLocation.longitude &&
                  searchCarRequest.searchLocation.latitude > 0 &&
                  searchCarRequest.searchLocation.longitude > 0
                    ? new google.maps.LatLng(
                        searchCarRequest.searchLocation.latitude,
                        searchCarRequest.searchLocation.longitude
                      )
                    : null
                }
              />
              <div
                className="absolute left-1/2 flex h-[48px] w-[48px] -translate-x-1/2 transform cursor-pointer items-center justify-center bg-[url('../images/ellipseUpBtn.png')] bg-cover bg-center bg-no-repeat xl:hidden"
                onClick={handleArrowClick}
              >
                <Image
                  src={mapArrow}
                  alt=""
                  className={`h-[22px] w-[32px] ${isExpanded ? "rotate-0 transform" : "rotate-180 transform"}`}
                />
              </div>
            </div>
          </div>
        </div>
        <FilterSlidingPanel
          initValue={searchCarFilters}
          onFilterApply={handleFilterApply}
          isOpen={openFilterPanel}
          closePanel={() => {
            setOpenFilterPanel(false);
          }}
          t={t}
        />
      </GoogleMapsProvider>
    </>
  );
}
