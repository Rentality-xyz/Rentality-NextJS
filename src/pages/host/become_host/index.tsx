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
import { CivicProvider } from "@/contexts/web3/civicContext";
import UserCommonInformationForm from "@/components/profileInfo/UserCommonInformationForm";
import UserDriverLicenseVerification from "@/components/profileInfo/UserDriverLicenseVerification";
import { isEmpty } from "@/utils/string";

function BecomeHost() {
  return (
    <CivicProvider>
      <BecomeHostContent />
    </CivicProvider>
  );
}

type BecameHostSteps = {
  isWalletConnected: boolean;
  isUserInfoSaved: boolean;
  isLicenseVerificationPassed: boolean;
  isCarListeded: boolean;
  isDiscountsAndPriceSaved: boolean;
};

function BecomeHostContent() {
  const { login } = useAuth();
  const ethereumInfo = useEthereum();
  const [isLoadingProfileSettings, savedProfileSettings, saveProfileSettings] = useProfileSettings();
  const [isLoadingDiscounts, savedTripsDiscounts, saveTripDiscounts] = useTripDiscounts();
  const [isLoadingDeliveryPrices, savedDeliveryPrices, saveDeliveryPrices] = useDeliveryPrices();
  const { userRole } = useUserRole();
  const { t } = useTranslation();

  const [becameHostSteps, setBecameHostSteps] = useState<BecameHostSteps>({
    isWalletConnected: false,
    isUserInfoSaved: false,
    isLicenseVerificationPassed: false,
    isCarListeded: false,
    isDiscountsAndPriceSaved: false,
  });

  useEffect(() => {
    if (!ethereumInfo) return;
    setBecameHostSteps((prev) => ({ ...prev, isWalletConnected: ethereumInfo.isWalletConnected }));
  }, [ethereumInfo]);
  const handleClickBlockConnectWallet = () => {
    if (!becameHostSteps.isWalletConnected) {
      login();
    }
  };

  const [openBlockUserInfo, setOpenBlockUserInfo] = useState(false);
  const handleClickOpenBlockUserInfo = () => {
    if (becameHostSteps.isWalletConnected && !becameHostSteps.isUserInfoSaved) {
      setOpenBlockUserInfo(!openBlockUserInfo);
    } else {
      setOpenBlockUserInfo(false);
    }
  };
  useEffect(() => {
    if (isLoadingProfileSettings) {
      setBecameHostSteps((prev) => ({ ...prev, isUserInfoSaved: false }));
      return;
    }

    setBecameHostSteps((prev) => ({
      ...prev,
      isUserInfoSaved: !isEmpty(savedProfileSettings.tcSignature) && savedProfileSettings.tcSignature !== "0x",
    }));
  }, [savedProfileSettings, isLoadingProfileSettings]);

  const [openBlockDriverLicense, setOpenBlockDriverLicense] = useState(false);
  const { gatewayStatus } = useGateway();
  const handleClickOpenBlockDriverLicense = () => {
    if (becameHostSteps.isUserInfoSaved && !becameHostSteps.isLicenseVerificationPassed) {
      setOpenBlockDriverLicense(!openBlockDriverLicense);
    } else {
      setOpenBlockDriverLicense(false);
    }
  };
  useEffect(() => {
    setBecameHostSteps((prev) => ({ ...prev, isLicenseVerificationPassed: gatewayStatus === GatewayStatus.ACTIVE }));
  }, [gatewayStatus]);

  const [openBlockListingCar, setOpenBlockListingCar] = useState(false);
  const [isLoadingMyListings, myListings] = useMyListings();
  const handleClickOpenBlockListingCar = () => {
    if (becameHostSteps.isLicenseVerificationPassed && !becameHostSteps.isCarListeded) {
      setOpenBlockListingCar(!openBlockListingCar);
    } else {
      setOpenBlockListingCar(false);
    }
  };
  useEffect(() => {
    if (isLoadingMyListings) return;
    setBecameHostSteps((prev) => ({ ...prev, isCarListeded: myListings.length > 0 }));
  }, [myListings, isLoadingMyListings]);

  const [openBlockDiscountsAndPrice, setOpenBlockDiscountsAndPrice] = useState(false);
  const handleClickOpenBlockDiscountsAndPrice = () => {
    if (becameHostSteps.isCarListeded && !becameHostSteps.isDiscountsAndPriceSaved) {
      setOpenBlockDiscountsAndPrice(!openBlockDiscountsAndPrice);
    } else {
      setOpenBlockDiscountsAndPrice(false);
    }
  };
  useEffect(() => {
    setBecameHostSteps((prev) => ({
      ...prev,
      isDiscountsAndPriceSaved:
        savedTripsDiscounts.isInitialized &&
        savedDeliveryPrices.from1To25milesPrice > 0 &&
        savedDeliveryPrices.over25MilesPrice > 0,
    }));
  }, [savedTripsDiscounts, savedDeliveryPrices]);

  useEffect(() => {
    if (becameHostSteps.isUserInfoSaved) {
      setOpenBlockUserInfo(false);
    }
    if (becameHostSteps.isLicenseVerificationPassed) {
      setOpenBlockDriverLicense(false);
    }
    if (becameHostSteps.isCarListeded) {
      setOpenBlockListingCar(false);
    }
    if (becameHostSteps.isDiscountsAndPriceSaved) {
      setOpenBlockDiscountsAndPrice(false);
    }
  }, [becameHostSteps]);

  const stepsPassed = Object.values(becameHostSteps).filter((i) => i === true).length;
  const stepsTotal = Object.values(becameHostSteps).length;
  const progress = (stepsPassed * 100) / stepsTotal;

  return (
    <>
      <PageTitle title={t("become_host.title")} />
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
                  {stepsPassed} of {stepsTotal} steps
                </span>
              </div>
            </div>
          </div>

          <div
            className="mt-5 flex w-fit cursor-pointer items-center justify-start pl-4"
            onClick={handleClickBlockConnectWallet}
          >
            <div className={`flex text-lg ${!becameHostSteps.isWalletConnected ? "text-white" : "text-[#FFFFFF70]"}`}>
              <CheckboxLight
                className={`underline ${becameHostSteps.isWalletConnected ? "text-[#FFFFFF70]" : ""}`}
                checked={becameHostSteps.isWalletConnected}
                checkedClassName={becameHostSteps.isWalletConnected ? "border-[#FFFFFF70]" : ""}
                checkMarkClassName={becameHostSteps.isWalletConnected ? "border-[#FFFFFF70]" : ""}
              />
              <span
                className={`pr-1 ${!becameHostSteps.isWalletConnected ? "text-rentality-secondary" : "text-[#FFFFFF70]"}`}
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
              className={`flex text-lg ${becameHostSteps.isWalletConnected && !becameHostSteps.isUserInfoSaved ? "text-white" : "text-[#FFFFFF70]"}`}
            >
              <CheckboxLight
                className="underline"
                checked={becameHostSteps.isUserInfoSaved}
                checkedClassName={
                  becameHostSteps.isWalletConnected && !becameHostSteps.isUserInfoSaved ? "" : "border-[#FFFFFF70]"
                }
                checkMarkClassName={
                  becameHostSteps.isWalletConnected && !becameHostSteps.isUserInfoSaved ? "" : "border-[#FFFFFF70]"
                }
              />
              <span
                className={`pr-1 ${becameHostSteps.isWalletConnected && !becameHostSteps.isUserInfoSaved ? "text-rentality-secondary" : "text-[#FFFFFF70]"}`}
              >
                2.
              </span>
              {t("become_host.enter_user_info")}
            </div>
            <Image
              src={openBlockUserInfo ? arrowUpTurquoise : arrowDownTurquoise}
              alt=""
              className={`ml-1 ${becameHostSteps.isWalletConnected && !becameHostSteps.isUserInfoSaved ? "" : "hidden"}`}
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
              className={`flex text-lg ${becameHostSteps.isUserInfoSaved && !becameHostSteps.isLicenseVerificationPassed ? "text-white" : "text-[#FFFFFF70]"}`}
            >
              <CheckboxLight
                className="underline"
                checked={becameHostSteps.isLicenseVerificationPassed}
                checkedClassName={
                  becameHostSteps.isUserInfoSaved && !becameHostSteps.isLicenseVerificationPassed
                    ? ""
                    : "border-[#FFFFFF70]"
                }
                checkMarkClassName={
                  becameHostSteps.isUserInfoSaved && !becameHostSteps.isLicenseVerificationPassed
                    ? ""
                    : "border-[#FFFFFF70]"
                }
              />
              <span
                className={`pr-1 ${becameHostSteps.isUserInfoSaved && !becameHostSteps.isLicenseVerificationPassed ? "text-rentality-secondary" : "text-[#FFFFFF70]"}`}
              >
                3.
              </span>
              {t("become_host.driver_license")}
            </div>
            <Image
              src={openBlockDriverLicense ? arrowUpTurquoise : arrowDownTurquoise}
              alt=""
              className={`ml-1 ${becameHostSteps.isUserInfoSaved && !becameHostSteps.isLicenseVerificationPassed ? "" : "hidden"}`}
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
              className={`flex text-lg ${becameHostSteps.isLicenseVerificationPassed && !becameHostSteps.isCarListeded ? "text-white" : "text-[#FFFFFF70]"}`}
            >
              <CheckboxLight
                className="underline"
                checked={becameHostSteps.isCarListeded}
                checkedClassName={
                  becameHostSteps.isLicenseVerificationPassed && !becameHostSteps.isCarListeded
                    ? ""
                    : "border-[#FFFFFF70]"
                }
                checkMarkClassName={
                  becameHostSteps.isLicenseVerificationPassed && !becameHostSteps.isCarListeded
                    ? ""
                    : "border-[#FFFFFF70]"
                }
              />
              <span
                className={`pr-1 ${becameHostSteps.isLicenseVerificationPassed && !becameHostSteps.isCarListeded ? "text-rentality-secondary" : "text-[#FFFFFF70]"}`}
              >
                4.
              </span>
              {t("become_host.listing_car")}
            </div>
            <Image
              src={openBlockListingCar ? arrowUpTurquoise : arrowDownTurquoise}
              alt=""
              className={`ml-1 ${becameHostSteps.isLicenseVerificationPassed && !becameHostSteps.isCarListeded ? "" : "hidden"}`}
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
              className={`flex text-lg ${becameHostSteps.isCarListeded && !becameHostSteps.isDiscountsAndPriceSaved ? "text-white" : "text-[#FFFFFF70]"}`}
            >
              <CheckboxLight
                className="underline"
                checked={becameHostSteps.isDiscountsAndPriceSaved}
                checkedClassName={
                  becameHostSteps.isCarListeded && !becameHostSteps.isDiscountsAndPriceSaved ? "" : "border-[#FFFFFF70]"
                }
                checkMarkClassName={
                  becameHostSteps.isCarListeded && !becameHostSteps.isDiscountsAndPriceSaved ? "" : "border-[#FFFFFF70]"
                }
              />
              <span
                className={`pr-1 ${becameHostSteps.isCarListeded && !becameHostSteps.isDiscountsAndPriceSaved ? "text-rentality-secondary" : "text-[#FFFFFF70]"}`}
              >
                5.
              </span>
              {t("become_host.discounts_and_price")}
            </div>
            <Image
              src={openBlockDiscountsAndPrice ? arrowUpTurquoise : arrowDownTurquoise}
              alt=""
              className={`ml-1 ${becameHostSteps.isCarListeded && !becameHostSteps.isDiscountsAndPriceSaved ? "" : "hidden"}`}
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
    </>
  );
}

BecomeHost.allowAnonymousAccess = true;

export default BecomeHost;
