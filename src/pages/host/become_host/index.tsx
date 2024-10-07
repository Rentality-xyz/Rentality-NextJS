import Loading from "@/components/common/Loading";
import DeliveryPriceForm from "@/components/host/deliveryPriceForm";
import TripDiscountsForm from "@/components/host/tripDiscountsForm";
import PageTitle from "@/components/pageTitle/pageTitle";
import {UserCommonInformationForm, UserDriverLicenseVerification} from "@/components/profileInfo/userProfileInfo";
import useDeliveryPrices from "@/hooks/host/useDeliveryPrices";
import useTripDiscounts from "@/hooks/host/useTripDiscounts";
import useProfileSettings from "@/hooks/useProfileSettings";
import useUserRole from "@/hooks/useUserRole";
import { useTranslation } from "react-i18next";
import React, {useEffect, useState} from "react";
import Image from "next/image";
import arrowUpTurquoise from "@/images/arrowUpTurquoise.svg";
import arrowDownTurquoise from "@/images/arrowDownTurquoise.svg";
import tutorialVideo from "@/images/tutorial_video.png";
import RntButton from "@/components/common/rntButton";
import {CheckboxLight} from "@/components/common/rntCheckbox";
import Link from "next/link";
import Listings from "@/pages/host/vehicles/listings";
import {useAuth} from "@/contexts/auth/authContext";
import {DialogActions} from "@/utils/dialogActions";
import {useRntDialogs} from "@/contexts/rntDialogsContext";
import {useEthereum} from "@/contexts/web3/ethereumContext";
import {GatewayStatus, useGateway} from "@civic/ethereum-gateway-react";
import useMyListings from "@/hooks/host/useMyListings";
import AddCar from "@/pages/host/vehicles/add";

export default function BecomeHost() {
    const { login } = useAuth();
    const ethereumInfo = useEthereum();
    const [isLoadingProfileSettings, savedProfileSettings, saveProfileSettings] = useProfileSettings();
    const [isLoadingDiscounts, savedTripsDiscounts, saveTripDiscounts] = useTripDiscounts();
    const [isLoadingDeliveryPrices, savedDeliveryPrices, saveDeliveryPrices] = useDeliveryPrices();
    const { userRole } = useUserRole();
    const { t } = useTranslation();

    const [progress, setProgress] = useState(60); // Устанавливаем начальное значение прогресса (в процентах)

    const [isStepConnectWalletCompleted, setIsStepConnectWalletCompleted] = useState<boolean | undefined | null>(undefined);
    useEffect(() => {
        // if (!ethereumInfo?.isWalletConnected) return;
        setIsStepConnectWalletCompleted(ethereumInfo?.isWalletConnected ?? false);
    }, [ethereumInfo]);
    const handleClickBlockConnectWallet = () => {
        if (!isStepConnectWalletCompleted) {
            login();
        }
    };

    const [isStepUserInfoCompleted, setIsStepUserInfoCompleted] = useState(false);
    const [openBlockUserInfo, setOpenBlockUserInfo] = useState(false);
    const handleClickOpenBlockUserInfo = () => {
        setOpenBlockUserInfo(!openBlockUserInfo);
    };
    useEffect(() => {
        setIsStepUserInfoCompleted(!!savedProfileSettings.tcSignature);
    }, [savedProfileSettings]);

    const [isStepDriverLicenseCompleted, setIsStepDriverLicenseCompleted] = useState<boolean | undefined | null>(undefined);
    const [openBlockDriverLicense, setOpenBlockDriverLicense] = useState(false);
    const { gatewayStatus } = useGateway();
    const handleClickOpenBlockDriverLicense = () => {
        setOpenBlockDriverLicense(!openBlockDriverLicense);
    };
    useEffect(() => {
        // if (!gatewayStatus) return;
        setIsStepDriverLicenseCompleted(gatewayStatus === GatewayStatus.ACTIVE);
    }, [gatewayStatus]);

    const [isStepListingCarCompleted, setIsStepListingCarCompleted] = useState(false);
    const [openBlockListingCar, setOpenBlockListingCar] = useState(false);
    const [isLoadingMyListings, myListings] = useMyListings();
    const handleClickOpenBlockListingCar = () => {
        setOpenBlockListingCar(!openBlockListingCar);
    };
    useEffect(() => {
        setIsStepListingCarCompleted(myListings.length > 0);
    }, [myListings]);

    const [isStepDiscountsAndPriceCompleted, setIsStepDiscountsAndPriceCompleted] = useState(false);
    const [openBlockDiscountsAndPrice, setOpenBlockDiscountsAndPrice] = useState(false);
    const handleClickOpenBlockDiscountsAndPrice = () => {
        setOpenBlockDiscountsAndPrice(!openBlockDiscountsAndPrice);
    };
    useEffect(() => {
        setIsStepDiscountsAndPriceCompleted(
            savedTripsDiscounts.discount3DaysAndMoreInPercents > 0
            && savedTripsDiscounts.discount7DaysAndMoreInPercents > 0
            && savedTripsDiscounts.discount30DaysAndMoreInPercents > 0
            && savedDeliveryPrices.from1To25milesPrice > 0
            && savedDeliveryPrices.over25MilesPrice > 0
        );
    }, [savedTripsDiscounts, savedDeliveryPrices]);

    const [isPageLoaded, setIsPageLoaded] = useState(false);
    useEffect(() => {
        if (
            isStepConnectWalletCompleted !== undefined && isStepConnectWalletCompleted !== null
            && isStepDriverLicenseCompleted !== undefined && isStepDriverLicenseCompleted !== null
        ) {
            setIsPageLoaded(true);
        }
    }, [isStepConnectWalletCompleted]);

    return (
        <>
            <PageTitle title={t("become_host.title")} />
            {!isPageLoaded && <Loading />}
            {isPageLoaded && (
                <>
                    <div className="flex justify-between mt-5">
                        <div>
                            <div className="text-start pl-4">{t("become_host.all_steps_car_sharing")}</div>

                            <div className="mt-5 w-full max-w-md">
                                {/* Контейнер для прогресс-бара */}
                                <div className="w-full h-10 overflow-hidden relative bg-[#BFBFBF] rounded-full">
                                    {/* Прогресс */}
                                    <div
                                        className="h-full bg-rentality-secondary transition-all duration-500 flex items-center justify-center text-white font-semibold"
                                        style={{ width: `${progress}%` }} // Устанавливаем ширину прогресс-бара в зависимости от прогресса
                                    >
                                        {/* Текст внутри прогресс-бара */}
                                        <span className="absolute pl-4 inset-0 flex items-center justify-start text-[#004F51]">
                                    3 of 5 steps
                                </span>
                                    </div>
                                </div>
                                {/* Кнопки для управления прогрессом */}
                                <div className="flex justify-center mt-4 space-x-2">
                                    <button
                                        onClick={() => setProgress((prev) => Math.max(prev - 20, 0))} // Уменьшаем прогресс на 20%
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    >
                                        Уменьшить
                                    </button>
                                    <button
                                        onClick={() => setProgress((prev) => Math.min(prev + 20, 100))} // Увеличиваем прогресс на 20%
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        Увеличить
                                    </button>
                                </div>
                            </div>

                            <div
                                className="flex mt-5 pl-4 w-fit items-center justify-start cursor-pointer"
                                onClick={handleClickBlockConnectWallet}
                            >
                                <div className="flex text-lg text-white">
                                    <CheckboxLight
                                        className="underline"
                                        checked={isStepConnectWalletCompleted ?? false}
                                    />
                                    <span className="text-rentality-secondary pr-1">1.</span>{t("become_host.connect_wallet")}
                                </div>
                                <Image src={arrowDownTurquoise} alt="" className="ml-1" />
                            </div>

                            <div
                                className="flex mt-5 pl-4 w-fit items-center justify-start cursor-pointer"
                                onClick={handleClickOpenBlockUserInfo}
                            >
                                <div className="flex text-lg text-white">
                                    <CheckboxLight
                                        className="underline"
                                        checked={isStepUserInfoCompleted}
                                        onChange={() => {
                                            setIsStepUserInfoCompleted(!isStepUserInfoCompleted);
                                        }}
                                    />
                                    <span className="text-rentality-secondary pr-1">2.</span>{t("become_host.enter_user_info")}
                                </div>
                                <Image src={openBlockUserInfo ? arrowUpTurquoise : arrowDownTurquoise} alt="" className="ml-1" />
                            </div>
                            {openBlockUserInfo && (
                                <div className="ml-10">
                                    <UserCommonInformationForm
                                        savedProfileSettings={savedProfileSettings}
                                        saveProfileSettings={saveProfileSettings}
                                        isHost={true}
                                    />
                                </div>
                            )}

                            <div
                                className="flex mt-5 pl-4 w-fit items-center justify-start cursor-pointer"
                                onClick={handleClickOpenBlockDriverLicense}
                            >
                                <div className="flex text-lg text-white">
                                    <CheckboxLight
                                        className="underline"
                                        checked={isStepDriverLicenseCompleted ?? false}
                                    />
                                    <span className="text-rentality-secondary pr-1">3.</span>{t("become_host.driver_license")}
                                </div>
                                <Image src={openBlockDriverLicense ? arrowUpTurquoise : arrowDownTurquoise} alt="" className="ml-1" />
                            </div>
                            {openBlockDriverLicense && (
                                <div className="ml-10">
                                    <UserDriverLicenseVerification savedProfileSettings={savedProfileSettings} />
                                </div>
                            )}

                            <div
                                className="flex mt-5 pl-4 w-fit items-center justify-start cursor-pointer"
                                onClick={handleClickOpenBlockListingCar}
                            >
                                <div className="flex text-lg text-white">
                                    <CheckboxLight
                                        className="underline"
                                        checked={isStepListingCarCompleted}
                                        onChange={() => {
                                            setIsStepListingCarCompleted(!isStepListingCarCompleted);
                                        }}
                                    />
                                    <span className="text-rentality-secondary pr-1">4.</span>{t("become_host.listing_car")}
                                </div>
                                <Image src={openBlockListingCar ? arrowUpTurquoise : arrowDownTurquoise} alt="" className="ml-1" />
                            </div>
                            {openBlockListingCar && (
                                <div className="ml-10">
                                    {/*<AddCar />*/}
                                </div>
                            )}

                            <div
                                className="flex mt-5 pl-4 w-fit items-center justify-start cursor-pointer"
                                onClick={handleClickOpenBlockDiscountsAndPrice}
                            >
                                <div className="flex text-lg text-white">
                                    <CheckboxLight
                                        className="underline"
                                        checked={isStepDiscountsAndPriceCompleted}
                                        onChange={() => {
                                            setIsStepDiscountsAndPriceCompleted(!isStepDiscountsAndPriceCompleted);
                                        }}
                                    />
                                    <span className="text-rentality-secondary pr-1">5.</span>{t("become_host.discounts_and_price")}
                                </div>
                                <Image src={openBlockDiscountsAndPrice ? arrowUpTurquoise : arrowDownTurquoise} alt="" className="ml-1" />
                            </div>
                            {openBlockDiscountsAndPrice && (
                                <div className="flex flex-col ml-10 min-[560px]:flex-row min-[560px]:gap-20">
                                    <TripDiscountsForm
                                        savedTripsDiscounts={savedTripsDiscounts}
                                        saveTripsDiscounts={saveTripDiscounts}
                                        isUserHasHostRole={userRole === "Host"}
                                        t={t}
                                    />
                                    <DeliveryPriceForm
                                        savedDeliveryPrices={savedDeliveryPrices}
                                        saveDeliveryPrices={saveDeliveryPrices}
                                        isUserHasHostRole={userRole === "Host"}
                                        t={t}
                                    />
                                </div>
                            )}
                            <div className="w-fit pl-4 mt-10">
                                <Link href={`/guest`}>
                                    {t("become_host.to_search_page")}<span className="text-rentality-secondary pl-1">{'>>'}</span>
                                </Link>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <Image src={tutorialVideo} alt="Tutorial video" className="ml-1" />
                            <RntButton type="submit" className="mt-4 w-full">
                                {t("become_host.btn_how_to_start")}
                            </RntButton>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}