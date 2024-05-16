import CarSearchItem from "@/components/guest/carSearchItem";
import useSearchCars from "@/hooks/guest/useSearchCars";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { dateToHtmlDateTimeFormat } from "@/utils/datetimeFormatters";
import { SearchCarRequest, emptySearchCarRequest } from "@/model/SearchCarRequest";
import { SearchCarInfo } from "@/model/SearchCarsResult";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { useUserInfo } from "@/contexts/userInfoContext";
import { isEmpty } from "@/utils/string";
import { usePrivy } from "@privy-io/react-auth";
import { DialogActions } from "@/utils/dialogActions";
import Layout from "@/components/layout/layout";
import { GoogleMapsProvider } from "@/contexts/googleMapsContext";
import CarSearchMap from "@/components/guest/carMap/carSearchMap";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/utils/i18n";
import moment from "moment";
import Image from "next/image";
import mapArrow from "@/images/arrUpBtn.png";
import FilterSlidingPanel from "@/components/search/filterSlidingPanel";
import SearchAndFilters from "@/components/search/searchAndFilters";

const defaultDateFrom = moment({ hour: 9 }).add(1, "day").toDate();
const defaultDateTo = moment({ hour: 9 }).add(2, "day").toDate();

const customEmptySearchCarRequest: SearchCarRequest = {
  ...emptySearchCarRequest,
  searchLocation: {
    ...emptySearchCarRequest.searchLocation,
    city: "Down town, Miami",
    state: "Florida",
    country: "USA",
  },
  dateFrom: dateToHtmlDateTimeFormat(defaultDateFrom),
  dateTo: dateToHtmlDateTimeFormat(defaultDateTo),
};

export default function Search() {
  const [isLoading, searchAvailableCars, searchResult, sortSearchResult, createTripRequest, setSearchResult] =
    useSearchCars();
  const [searchCarRequest, setSearchCarRequest] = useState<SearchCarRequest>(customEmptySearchCarRequest);
  const [requestSending, setRequestSending] = useState<boolean>(false);
  const [openFilterPanel, setOpenFilterPanel] = useState(false);
  const { showInfo, showError, showDialog, hideDialogs } = useRntDialogs();
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [selectedCarID, setSelectedCarID] = useState<Number | null>(null);

  const userInfo = useUserInfo();
  const router = useRouter();
  const { authenticated, login } = usePrivy();
  const { t } = useTranslation();

  const t_page: TFunction = (path, options) => {
    return t("search_page." + path, options);
  };
  const t_errors: TFunction = (name, options) => {
    return t_page("errors." + name, options);
  };

  const handleSearchClick = async () => {
    const result = await searchAvailableCars(searchCarRequest);
    if (result) {
      setSortBy(undefined);
    }
  };

  const handleRentCarRequest = async (carInfo: SearchCarInfo) => {
    if (!authenticated) {
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

  const handleSetMapMarkerSelected = (carID: Number) => {
    const newSearchCarInfo = { ...searchResult };

    newSearchCarInfo.carInfos.forEach((item: SearchCarInfo) => {
      if (item.carId == carID) {
        item.highlighted = !item.highlighted;
      } else {
        item.highlighted = false;
      }
    });

    setSearchResult(newSearchCarInfo);
    setSelectedCarID(carID == selectedCarID ? null : carID);
  };

  useEffect(() => {
    if (sortBy === undefined) return;
    sortSearchResult(sortBy);
  }, [sortBy, sortSearchResult]);

  const [isExpanded, setIsExpanded] = useState(false);

  const handleArrowClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Layout>
      <GoogleMapsProvider libraries={["maps", "marker", "places"]}>
        <div className="flex flex-col xl:h-full" title="Search">
          <SearchAndFilters
            searchCarRequest={searchCarRequest}
            setSearchCarRequest={setSearchCarRequest}
            sortBy={sortBy}
            setSortBy={setSortBy}
            handleSearchClick={handleSearchClick}
            setOpenFilterPanel={setOpenFilterPanel}
            t={t}
          />
          <div className="mb-8 flex flex-row"></div>
          {isLoading ? (
            <div className="flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
          ) : (
            <>
              <div className="text-l font-bold">
                {searchResult?.carInfos?.length ?? 0} {t_page("info.cars_available")}
              </div>
              <div className="flex gap-3 max-xl:flex-col-reverse xl:h-full">
                <div className="xl:w-8/12 2xl:w-7/12 fullHD:w-6/12 my-4 flex flex-col gap-4">
                  {searchResult?.carInfos?.length > 0 ? (
                    searchResult?.carInfos
                      .sort((a: SearchCarInfo, b: SearchCarInfo) => {
                        if (a.highlighted && !b.highlighted) {
                          return -1;
                        } else if (!a.highlighted && b.highlighted) {
                          return 1;
                        } else {
                          return 0;
                        }
                      })
                      .map((value: SearchCarInfo) => {
                        return (
                          <CarSearchItem
                            key={value.carId}
                            searchInfo={value}
                            handleRentCarRequest={handleRentCarRequest}
                            disableButton={requestSending}
                            isSelected={selectedCarID == value.carId}
                            setSelected={(carID: Number) => {
                              setSelectedCarID(carID == selectedCarID ? null : carID);
                            }}
                            t={t_page}
                          />
                        );
                      })
                  ) : (
                    <div className="flex max-w-screen-xl flex-wrap justify-between text-center xl:h-full">
                      {t_page("info.no_cars")}
                    </div>
                  )}
                </div>
                <div className="xl:w-4/12 2xl:w-5/12 fullHD:w-6/12 my-4 max-xl:mb-8">
                  <CarSearchMap
                    carInfos={searchResult?.carInfos}
                    setSelected={handleSetMapMarkerSelected}
                    selectedCarID={selectedCarID}
                    isExpanded={isExpanded}
                    defaultCenter={
                      searchCarRequest.searchLocation.locationLat &&
                      searchCarRequest.searchLocation.locationLng &&
                      searchCarRequest.searchLocation.locationLat > 0 &&
                      searchCarRequest.searchLocation.locationLat > 0
                        ? new google.maps.LatLng(
                            searchCarRequest.searchLocation.locationLat,
                            searchCarRequest.searchLocation.locationLng
                          )
                        : null
                    }
                  />
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 flex justify-center items-center xl:hidden z-[99] w-[48px] h-[48px] cursor-pointer bg-[url('../images/ellipseUpBtn.png')] bg-cover bg-no-repeat bg-center"
                    onClick={handleArrowClick}
                  >
                    <Image
                      src={mapArrow}
                      alt=""
                      className={`w-[32px] h-[22px] ${isExpanded ? "transform rotate-0" : "transform rotate-180"}`}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <FilterSlidingPanel
          searchCarRequest={searchCarRequest}
          setSearchCarRequest={setSearchCarRequest}
          handleSearchClick={handleSearchClick}
          openFilterPanel={openFilterPanel}
          setOpenFilterPanel={setOpenFilterPanel}
          t={t}
        />
      </GoogleMapsProvider>
    </Layout>
  );
}
