import DeliveryPriceForm from "@/components/host/deliveryPriceForm";
import TripDiscountsForm from "@/components/host/tripDiscountsForm";
import PageTitle from "@/components/pageTitle/pageTitle";
import useDeliveryPrices from "@/hooks/host/useDeliveryPrices";
import useTripDiscounts from "@/hooks/host/useTripDiscounts";
import useProfileSettings from "@/hooks/useProfileSettings";
import useUserRole from "@/hooks/useUserRole";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import arrowUpTurquoise from "@/images/arrows/arrowUpTurquoise.svg";
import arrowDownTurquoise from "@/images/arrows/arrowDownTurquoise.svg";
import tutorialVideo from "@/images/tutorial_video.png";
import RntButton from "@/components/common/rntButton";
import { CheckboxLight } from "@/components/common/rntCheckbox";
import Link from "next/link";
import { useAuth } from "@/contexts/auth/authContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { GatewayStatus, useGateway } from "@civic/ethereum-gateway-react";
import useMyListings from "@/hooks/host/useMyListings";
import AddCar from "@/pages/host/vehicles/add";
import RntSuspense from "@/components/common/rntSuspense";
import { CivicProvider } from "@/contexts/web3/civicContext";
import UserCommonInformationForm from "@/components/profileInfo/UserCommonInformationForm";
import UserDriverLicenseVerification from "@/components/profileInfo/UserDriverLicenseVerification";
import Search from "@/pages/guest/search";

function BecomeHost() {
  return (
    <CivicProvider>
      <BecomeHostContent />
    </CivicProvider>
  );
}

function BecomeHostContent() {
  const { login } = useAuth();
  const ethereumInfo = useEthereum();
  const [isLoadingProfileSettings, savedProfileSettings, saveProfileSettings] = useProfileSettings();
  const [isLoadingDiscounts, savedTripsDiscounts, saveTripDiscounts] = useTripDiscounts();
  const [isLoadingDeliveryPrices, savedDeliveryPrices, saveDeliveryPrices] = useDeliveryPrices();
  const { userRole } = useUserRole();
  const { t } = useTranslation();

  let [countStepsTaken, setCountStepsTaken] = useState(0);

  const [progress, setProgress] = useState(0);

  const [isStepConnectWalletCompleted, setIsStepConnectWalletCompleted] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    if (ethereumInfo === undefined) return;
    setIsStepConnectWalletCompleted(ethereumInfo?.isWalletConnected ?? false);
  }, [ethereumInfo]);
  useEffect(() => {
    if (isStepConnectWalletCompleted) {
      countStepsTaken = countStepsTaken + 1;
      setCountStepsTaken(countStepsTaken);
      setProgress(countStepsTaken * 20);
    }
  }, [isStepConnectWalletCompleted]);
  const handleClickBlockConnectWallet = () => {
    if (!isStepConnectWalletCompleted) {
      login();
    }
  };

  const [isStepUserInfoCompleted, setIsStepUserInfoCompleted] = useState<boolean | undefined>(undefined);
  const [openBlockUserInfo, setOpenBlockUserInfo] = useState(false);
  const handleClickOpenBlockUserInfo = () => {
    if (isStepConnectWalletCompleted && !isStepUserInfoCompleted) {
      setOpenBlockUserInfo(!openBlockUserInfo);
    } else {
      setOpenBlockUserInfo(false);
    }
  };
  useEffect(() => {
    if (isLoadingProfileSettings) {
      setIsStepUserInfoCompleted(false);
      return;
    }
    setIsStepUserInfoCompleted(!!savedProfileSettings.tcSignature);
  }, [savedProfileSettings, isLoadingProfileSettings]);
  useEffect(() => {
    if (isStepUserInfoCompleted) {
      countStepsTaken = countStepsTaken + 1;
      setCountStepsTaken(countStepsTaken);
      setProgress(countStepsTaken * 20);
    }
  }, [isStepUserInfoCompleted]);

  const [isStepDriverLicenseCompleted, setIsStepDriverLicenseCompleted] = useState<boolean | undefined>(undefined);
  const [openBlockDriverLicense, setOpenBlockDriverLicense] = useState(false);
  const { gatewayStatus } = useGateway();
  const handleClickOpenBlockDriverLicense = () => {
    if (isStepUserInfoCompleted && !isStepDriverLicenseCompleted) {
      setOpenBlockDriverLicense(!openBlockDriverLicense);
    } else {
      setOpenBlockDriverLicense(false);
    }
  };
  useEffect(() => {
    setIsStepDriverLicenseCompleted(gatewayStatus === GatewayStatus.ACTIVE);
  }, [gatewayStatus, isStepConnectWalletCompleted]);
  useEffect(() => {
    if (isStepDriverLicenseCompleted) {
      countStepsTaken = countStepsTaken + 1;
      setCountStepsTaken(countStepsTaken);
      setProgress(countStepsTaken * 20);
    }
  }, [isStepDriverLicenseCompleted]);

  const [isStepListingCarCompleted, setIsStepListingCarCompleted] = useState(false);
  const [openBlockListingCar, setOpenBlockListingCar] = useState(false);
  const [isLoadingMyListings, myListings] = useMyListings();
  const handleClickOpenBlockListingCar = () => {
    if (isStepDriverLicenseCompleted && !isStepListingCarCompleted) {
      setOpenBlockListingCar(!openBlockListingCar);
    } else {
      setOpenBlockListingCar(false);
    }
  };
  useEffect(() => {
    if (isLoadingMyListings) return;
    setIsStepListingCarCompleted(myListings.length > 0);
  }, [myListings, isLoadingMyListings]);
  useEffect(() => {
    if (isStepListingCarCompleted) {
      countStepsTaken = countStepsTaken + 1;
      setCountStepsTaken(countStepsTaken);
      setProgress(countStepsTaken * 20);
    }
  }, [isStepListingCarCompleted]);

  const [isStepDiscountsAndPriceCompleted, setIsStepDiscountsAndPriceCompleted] = useState(false);
  const [openBlockDiscountsAndPrice, setOpenBlockDiscountsAndPrice] = useState(false);
  const handleClickOpenBlockDiscountsAndPrice = () => {
    if (isStepListingCarCompleted && !isStepDiscountsAndPriceCompleted) {
      setOpenBlockDiscountsAndPrice(!openBlockDiscountsAndPrice);
    } else {
      setOpenBlockDiscountsAndPrice(false);
    }
  };
  useEffect(() => {
    setIsStepDiscountsAndPriceCompleted(
      savedTripsDiscounts.discount3DaysAndMoreInPercents > 0 &&
        savedTripsDiscounts.discount7DaysAndMoreInPercents > 0 &&
        savedTripsDiscounts.discount30DaysAndMoreInPercents > 0 &&
        savedDeliveryPrices.from1To25milesPrice > 0 &&
        savedDeliveryPrices.over25MilesPrice > 0
    );
  }, [savedTripsDiscounts, savedDeliveryPrices]);
  useEffect(() => {
    if (isStepDiscountsAndPriceCompleted) {
      countStepsTaken = countStepsTaken + 1;
      setCountStepsTaken(countStepsTaken);
      setProgress(countStepsTaken * 20);
    }
  }, [isStepDiscountsAndPriceCompleted]);

  const [isPageLoaded, setIsPageLoaded] = useState(false);
  useEffect(() => {
    if (isStepUserInfoCompleted) {
      setOpenBlockUserInfo(false);
    }
    if (isStepDriverLicenseCompleted) {
      setOpenBlockDriverLicense(false);
    }
    if (isStepListingCarCompleted) {
      setOpenBlockListingCar(false);
    }
    if (isStepDiscountsAndPriceCompleted) {
      setOpenBlockDiscountsAndPrice(false);
    }
    if (
      isStepConnectWalletCompleted !== undefined &&
      isStepUserInfoCompleted !== undefined &&
      isStepDriverLicenseCompleted !== undefined &&
      isStepListingCarCompleted !== undefined &&
      isStepDiscountsAndPriceCompleted !== undefined
    ) {
      setIsPageLoaded(true);
    }
  }, [
    isStepConnectWalletCompleted,
    isStepUserInfoCompleted,
    isStepDriverLicenseCompleted,
    isStepListingCarCompleted,
    isStepDiscountsAndPriceCompleted,
  ]);

  return (
    <>
      <PageTitle title={t("become_host.title")} />
      <RntSuspense isLoading={!isPageLoaded}>
        <div className="mt-5 flex flex-col justify-between xl:flex-row">
          <div>
            <div className="pl-4 text-start">{t("become_host.all_steps_car_sharing")}</div>

            <div className="mt-5 w-full max-w-md">
              {/* Контейнер для прогресс-бара */}
              <div className="relative h-10 w-full overflow-hidden rounded-full bg-[#BFBFBF]">
                {/* Прогресс */}
                <div
                  className="flex h-full items-center justify-center bg-rentality-secondary font-semibold text-white transition-all duration-500"
                  style={{ width: `${progress}%` }} // Устанавливаем ширину прогресс-бара в зависимости от прогресса
                >
                  {/* Текст внутри прогресс-бара */}
                  <span className="absolute inset-0 flex items-center justify-start pl-4 text-[#004F51]">
                    {countStepsTaken} of 5 steps
                  </span>
                </div>
              </div>
            </div>

            <div
              className="mt-5 flex w-fit cursor-pointer items-center justify-start pl-4"
              onClick={handleClickBlockConnectWallet}
            >
              <div className={`flex text-lg ${!isStepConnectWalletCompleted ? "text-white" : "text-[#FFFFFF70]"}`}>
                <CheckboxLight
                  className={`underline ${isStepConnectWalletCompleted ? "text-[#FFFFFF70]" : ""}`}
                  checked={isStepConnectWalletCompleted ?? false}
                  checkedClassName={isStepConnectWalletCompleted ? "border-[#FFFFFF70]" : ""}
                  checkMarkClassName={isStepConnectWalletCompleted ? "border-[#FFFFFF70]" : ""}
                />
                <span
                  className={`pr-1 ${!isStepConnectWalletCompleted ? "text-rentality-secondary" : "text-[#FFFFFF70]"}`}
                >
                  1.
                </span>
                {t("become_host.connect_wallet")}
              </div>
            </div>

            <div
              className="mt-5 flex w-fit cursor-pointer items-center justify-start pl-4"
              onClick={handleClickOpenBlockUserInfo}
            >
              <div
                className={`flex text-lg ${isStepConnectWalletCompleted && !isStepUserInfoCompleted ? "text-white" : "text-[#FFFFFF70]"}`}
              >
                <CheckboxLight
                  className="underline"
                  checked={isStepUserInfoCompleted ?? false}
                  checkedClassName={
                    isStepConnectWalletCompleted && !isStepUserInfoCompleted ? "" : "border-[#FFFFFF70]"
                  }
                  checkMarkClassName={
                    isStepConnectWalletCompleted && !isStepUserInfoCompleted ? "" : "border-[#FFFFFF70]"
                  }
                />
                <span
                  className={`pr-1 ${isStepConnectWalletCompleted && !isStepUserInfoCompleted ? "text-rentality-secondary" : "text-[#FFFFFF70]"}`}
                >
                  2.
                </span>
                {t("become_host.enter_user_info")}
              </div>
              <Image
                src={openBlockUserInfo ? arrowUpTurquoise : arrowDownTurquoise}
                alt=""
                className={`ml-1 ${isStepConnectWalletCompleted && !isStepUserInfoCompleted ? "" : "hidden"}`}
              />
            </div>
            {openBlockUserInfo && (
              <div className="ml-10">
                <UserCommonInformationForm
                  savedProfileSettings={savedProfileSettings}
                  saveProfileSettings={saveProfileSettings}
                />
              </div>
            )}

            <div
              className="mt-5 flex w-fit cursor-pointer items-center justify-start pl-4"
              onClick={handleClickOpenBlockDriverLicense}
            >
              <div
                className={`flex text-lg ${isStepUserInfoCompleted && !isStepDriverLicenseCompleted ? "text-white" : "text-[#FFFFFF70]"}`}
              >
                <CheckboxLight
                  className="underline"
                  checked={isStepDriverLicenseCompleted ?? false}
                  checkedClassName={
                    isStepUserInfoCompleted && !isStepDriverLicenseCompleted ? "" : "border-[#FFFFFF70]"
                  }
                  checkMarkClassName={
                    isStepUserInfoCompleted && !isStepDriverLicenseCompleted ? "" : "border-[#FFFFFF70]"
                  }
                />
                <span
                  className={`pr-1 ${isStepUserInfoCompleted && !isStepDriverLicenseCompleted ? "text-rentality-secondary" : "text-[#FFFFFF70]"}`}
                >
                  3.
                </span>
                {t("become_host.driver_license")}
              </div>
              <Image
                src={openBlockDriverLicense ? arrowUpTurquoise : arrowDownTurquoise}
                alt=""
                className={`ml-1 ${isStepUserInfoCompleted && !isStepDriverLicenseCompleted ? "" : "hidden"}`}
              />
            </div>
            {openBlockDriverLicense && (
              <div className="ml-10">
                <UserDriverLicenseVerification savedProfileSettings={savedProfileSettings} />
              </div>
            )}

            <div
              className="mt-5 flex w-fit cursor-pointer items-center justify-start pl-4"
              onClick={handleClickOpenBlockListingCar}
            >
              <div
                className={`flex text-lg ${isStepDriverLicenseCompleted && !isStepListingCarCompleted ? "text-white" : "text-[#FFFFFF70]"}`}
              >
                <CheckboxLight
                  className="underline"
                  checked={isStepListingCarCompleted ?? false}
                  checkedClassName={
                    isStepDriverLicenseCompleted && !isStepListingCarCompleted ? "" : "border-[#FFFFFF70]"
                  }
                  checkMarkClassName={
                    isStepDriverLicenseCompleted && !isStepListingCarCompleted ? "" : "border-[#FFFFFF70]"
                  }
                />
                <span
                  className={`pr-1 ${isStepDriverLicenseCompleted && !isStepListingCarCompleted ? "text-rentality-secondary" : "text-[#FFFFFF70]"}`}
                >
                  4.
                </span>
                {t("become_host.listing_car")}
              </div>
              <Image
                src={openBlockListingCar ? arrowUpTurquoise : arrowDownTurquoise}
                alt=""
                className={`ml-1 ${isStepDriverLicenseCompleted && !isStepListingCarCompleted ? "" : "hidden"}`}
              />
            </div>
            {openBlockListingCar && (
              <div className="ml-10 mt-4">
                <AddCar />
              </div>
            )}

            <div
              className="mt-5 flex w-fit cursor-pointer items-center justify-start pl-4"
              onClick={handleClickOpenBlockDiscountsAndPrice}
            >
              <div
                className={`flex text-lg ${isStepListingCarCompleted && !isStepDiscountsAndPriceCompleted ? "text-white" : "text-[#FFFFFF70]"}`}
              >
                <CheckboxLight
                  className="underline"
                  checked={isStepDiscountsAndPriceCompleted ?? false}
                  checkedClassName={
                    isStepListingCarCompleted && !isStepDiscountsAndPriceCompleted ? "" : "border-[#FFFFFF70]"
                  }
                  checkMarkClassName={
                    isStepListingCarCompleted && !isStepDiscountsAndPriceCompleted ? "" : "border-[#FFFFFF70]"
                  }
                />
                <span
                  className={`pr-1 ${isStepListingCarCompleted && !isStepDiscountsAndPriceCompleted ? "text-rentality-secondary" : "text-[#FFFFFF70]"}`}
                >
                  5.
                </span>
                {t("become_host.discounts_and_price")}
              </div>
              <Image
                src={openBlockDiscountsAndPrice ? arrowUpTurquoise : arrowDownTurquoise}
                alt=""
                className={`ml-1 ${isStepListingCarCompleted && !isStepDiscountsAndPriceCompleted ? "" : "hidden"}`}
              />
            </div>
            {openBlockDiscountsAndPrice && (
              <div className="ml-10 flex flex-col min-[560px]:flex-row min-[560px]:gap-20">
                <TripDiscountsForm
                  savedTripsDiscounts={savedTripsDiscounts}
                  saveTripsDiscounts={saveTripDiscounts}
                  isUserHasHostRole={userRole === "Host"}
                />
                <DeliveryPriceForm
                  savedDeliveryPrices={savedDeliveryPrices}
                  saveDeliveryPrices={saveDeliveryPrices}
                  isUserHasHostRole={userRole === "Host"}
                />
              </div>
            )}
            <div className="mt-10 w-fit pl-4">
              <Link href={`/guest`}>
                {t("become_host.to_search_page")}
                <span className="pl-1 text-rentality-secondary">{">>"}</span>
              </Link>
            </div>
          </div>
          <div className="flex flex-col max-xl:mt-8">
            <Image src={tutorialVideo} alt="Tutorial video" className="ml-1" />
            <RntButton type="submit" className="mt-4 w-full">
              {t("become_host.btn_how_to_start")}
            </RntButton>
          </div>
        </div>
      </RntSuspense>
    </>
  );
}

BecomeHost.allowAnonymousAccess = true;

export default BecomeHost;
