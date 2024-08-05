import useSearchCars from "@/hooks/guest/useSearchCars";
import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import {dateToHtmlDateTimeFormat} from "@/utils/datetimeFormatters";
import {SearchCarRequest, emptySearchCarRequest} from "@/model/SearchCarRequest";
import {SearchCarInfo} from "@/model/SearchCarsResult";
import {useRntDialogs} from "@/contexts/rntDialogsContext";
import {useUserInfo} from "@/contexts/userInfoContext";
import {isEmpty} from "@/utils/string";
import {usePrivy} from "@privy-io/react-auth";
import {DialogActions} from "@/utils/dialogActions";
import Layout from "@/components/layout/layout";
import {GoogleMapsProvider} from "@/contexts/googleMapsContext";
import CarSearchMap from "@/components/guest/carMap/carSearchMap";
import {useTranslation} from "react-i18next";
import {TFunction} from "@/utils/i18n";
import moment from "moment";
import Image from "next/image";
import mapArrow from "@/images/arrUpBtn.png";
import FilterSlidingPanel from "@/components/search/filterSlidingPanel";
import SearchAndFilters from "@/components/search/searchAndFilters";
import InvestCar from "@/components/investment/investCar";
import useGetInvestments from "@/hooks/guest/useGetInvestments";
import {getMetaDataFromIpfs, parseMetaData} from "@/utils/ipfsUtils";
import {InvestmentDTO} from "@/model/blockchain/schemas";

const defaultDateFrom = moment({hour: 9}).add(1, "day").toDate();
const defaultDateTo = moment({hour: 9}).add(4, "day").toDate();

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

export default function Invest() {
    const [isLoading, searchAvailableCars, searchResult, sortSearchResult, createTripRequest, setSearchResult] =
        useSearchCars();
    const [searchCarRequest, setSearchCarRequest] = useState<SearchCarRequest>(customEmptySearchCarRequest);
    const [requestSending, setRequestSending] = useState<boolean>(false);
    const {showInfo, showError, showDialog, hideDialogs} = useRntDialogs();
    const [sortBy, setSortBy] = useState<string | undefined>(undefined);
    const [selectedCarID, setSelectedCarID] = useState<number | null>(null);

    const userInfo = useUserInfo();
    const router = useRouter();
    const {authenticated, login} = usePrivy();
    const {t} = useTranslation();
    const {investments} = useGetInvestments()
    const [loaded, setLoaded] = useState(false)
    const [metadata, setMetadata] = useState({})

    const t_page: TFunction = (path, options) => {
        return t("search_page." + path, options);
    };
    const t_errors: TFunction = (name, options) => {
        return t_page("errors." + name, options);
    };

    const handleGetMetadata= async (searchInfo:InvestmentDTO) => {
      return parseMetaData(await getMetaDataFromIpfs(searchInfo.investment.car.tokenUri));
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
    let cars: SearchCarInfo[] = [
        {
            carId: 1,
            ownerAddress: "123 Main St, Moscow, Russia",
            image: "https://ipfs.io/ipfs/QmX6ZL52rTG4KbFKMdSNiaG5BT18cHeYnvtE6eAD1deRWo",
            brand: "Ford",
            model: "Mustang",
            year: "2019",
            seatsNumber: "5",
            transmission: "Automatic",
            engineTypeText: "Hybrid",
            milesIncludedPerDay: "200",
            pricePerDay: 50000,
            pricePerDayWithDiscount: 45,
            tripDays: 5,
            totalPriceWithDiscount: 225,
            taxes: 20,
            securityDeposit: 100,
            hostPhotoUrl: "https://example.com/host1.jpg",
            hostName: "Ivan Ivanov",
            timeZoneId: "Europe/Moscow",
            location: {
                lat: 55.7558,
                lng: 37.6176,
            },
            highlighted: true,
            daysDiscount: "10%",
            totalDiscount: "10%",
            hostHomeLocation: "Moscow, Russia",
            isInsuranceIncluded: true,
            deliveryPrices: {
                from1To25milesPrice: 10,
                over25MilesPrice: 20,
            },
            pickUpDeliveryFee: 15,
            dropOffDeliveryFee: 15,
            isCarDetailsConfirmed: true,
        },
        {
            carId: 2,
            ownerAddress: "456 Elm St, Saint Petersburg, Russia",
            image: "https://ipfs.io/ipfs/QmccDWKrsSHWDuSU81yFZutoi6X9SCcayL2Rjv9SuF8Sr2",
            brand: "BMW",
            model: "330i",
            year: "2020",
            seatsNumber: "5",
            transmission: "Automatic",
            engineTypeText: "Diesel",
            milesIncludedPerDay: "150",
            pricePerDay: 30000,
            pricePerDayWithDiscount: 90,
            tripDays: 3,
            totalPriceWithDiscount: 270,
            taxes: 30,
            securityDeposit: 200,
            hostPhotoUrl: "https://example.com/host2.jpg",
            hostName: "Sergey Petrov",
            timeZoneId: "Europe/Moscow",
            location: {
                lat: 59.9343,
                lng: 30.3351,
            },
            highlighted: false,
            daysDiscount: "10%",
            totalDiscount: "10%",
            hostHomeLocation: "Saint Petersburg, Russia",
            isInsuranceIncluded: false,
            deliveryPrices: {
                from1To25milesPrice: 15,
                over25MilesPrice: 25,
            },
            pickUpDeliveryFee: 20,
            dropOffDeliveryFee: 20,
            isCarDetailsConfirmed: true,
        },
        {
            carId: 3,
            ownerAddress: "789 Pine St, Novosibirsk, Russia",
            image: "https://ipfs.io/ipfs/QmfMjQzB2WWvCxLneUScV1waKQDnyiSxmD9oNBSoaBzZ4F",
            brand: "Porshe",
            model: "911",
            year: "2018",
            seatsNumber: "5",
            transmission: "Manual",
            engineTypeText: "Petrol",
            milesIncludedPerDay: "100",
            pricePerDay: 75000,
            pricePerDayWithDiscount: 65,
            tripDays: 7,
            totalPriceWithDiscount: 455,
            taxes: 25,
            securityDeposit: 150,
            hostPhotoUrl: "https://example.com/host3.jpg",
            hostName: "Anna Smirnova",
            timeZoneId: "Asia/Novosibirsk",
            location: {
                lat: 55.0084,
                lng: 82.9357,
            },
            highlighted: true,
            daysDiscount: "15%",
            totalDiscount: "15%",
            hostHomeLocation: "Novosibirsk, Russia",
            isInsuranceIncluded: true,
            deliveryPrices: {
                from1To25milesPrice: 12,
                over25MilesPrice: 22,
            },
            pickUpDeliveryFee: 18,
            dropOffDeliveryFee: 18,
            isCarDetailsConfirmed: true,
        },
    ];
    useEffect(()=>{
        if(investments) {
            investments.forEach(value => console.log("invests",value))
            // console.log("inve",investments)
        }
    },[investments])

    return (
        <Layout>
            {investments.map(value => {
                console.log("INVEST", investments)
                return (
                    <InvestCar
                        key={value.investment.investmentId as unknown as number}
                        searchInfo={value}
                        handleRentCarRequest={handleRentCarRequest}
                        disableButton={requestSending}
                        isSelected={selectedCarID == value.investment.investmentId as unknown as number}
                        setSelected={(carID: number) => {
                            setSelectedCarID(carID == selectedCarID ? null : carID);
                        }}
                        t={t_page}
                    />)
            })}

        </Layout>
    );
}
