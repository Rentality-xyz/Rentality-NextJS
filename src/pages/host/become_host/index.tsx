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
import useToggleState from "@/hooks/useToggleState";

function BecomeHost() {
  return (
    <CivicProvider>
      <BecomeHostContent />
    </CivicProvider>
  );
}

type BecomeHostSteps = {
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
  const [isLoadingMyListings, myListings] = useMyListings();
  const [isLoadingDiscounts, savedTripsDiscounts, saveTripDiscounts] = useTripDiscounts();
  const [isLoadingDeliveryPrices, savedDeliveryPrices, saveDeliveryPrices] = useDeliveryPrices();
  const { userRole } = useUserRole();
  const { t } = useTranslation();

  const [becomeHostSteps, setBecomeHostSteps] = useState<BecomeHostSteps>({
    isWalletConnected: false,
    isUserInfoSaved: false,
    isLicenseVerificationPassed: false,
    isCarListeded: false,
    isDiscountsAndPriceSaved: false,
  });

  const handleClickBlockConnectWallet = () => {
    if (!becomeHostSteps.isWalletConnected) {
      login();
    }
  };
  useEffect(() => {
    if (!ethereumInfo) return;
    setBecomeHostSteps((prev) => ({ ...prev, isWalletConnected: ethereumInfo.isWalletConnected }));
  }, [ethereumInfo]);

  const [openBlockUserInfo, toggleOpenBlockUserInfo] = useToggleState(false);
  const handleClickOpenBlockUserInfo = () => {
    if (becomeHostSteps.isWalletConnected && !becomeHostSteps.isUserInfoSaved) {
      toggleOpenBlockUserInfo();
    } else {
      toggleOpenBlockUserInfo(false);
    }
  };
  useEffect(() => {
    if (isLoadingProfileSettings) {
      setBecomeHostSteps((prev) => ({ ...prev, isUserInfoSaved: false }));
      return;
    }

    setBecomeHostSteps((prev) => ({
      ...prev,
      isUserInfoSaved: !isEmpty(savedProfileSettings.tcSignature) && savedProfileSettings.tcSignature !== "0x",
    }));
  }, [savedProfileSettings, isLoadingProfileSettings]);

  const [openBlockDriverLicense, toggleOpenBlockDriverLicense] = useToggleState(false);
  const { gatewayStatus } = useGateway();
  const handleClickOpenBlockDriverLicense = () => {
    if (becomeHostSteps.isUserInfoSaved && !becomeHostSteps.isLicenseVerificationPassed) {
      toggleOpenBlockDriverLicense();
    } else {
      toggleOpenBlockDriverLicense(false);
    }
  };
  useEffect(() => {
    setBecomeHostSteps((prev) => ({ ...prev, isLicenseVerificationPassed: gatewayStatus === GatewayStatus.ACTIVE }));
  }, [gatewayStatus]);

  const [openBlockListingCar, toggleOpenBlockListingCar] = useToggleState(false);
  const handleClickOpenBlockListingCar = () => {
    if (becomeHostSteps.isLicenseVerificationPassed && !becomeHostSteps.isCarListeded) {
      toggleOpenBlockListingCar();
    } else {
      toggleOpenBlockListingCar(false);
    }
  };
  useEffect(() => {
    if (isLoadingMyListings) return;
    setBecomeHostSteps((prev) => ({ ...prev, isCarListeded: myListings.length > 0 }));
  }, [myListings, isLoadingMyListings]);

  const [openBlockDiscountsAndPrice, toggleOpenBlockDiscountsAndPrice] = useToggleState(false);
  const handleClickOpenBlockDiscountsAndPrice = () => {
    if (becomeHostSteps.isCarListeded && !becomeHostSteps.isDiscountsAndPriceSaved) {
      toggleOpenBlockDiscountsAndPrice();
    } else {
      toggleOpenBlockDiscountsAndPrice(false);
    }
  };
  useEffect(() => {
    setBecomeHostSteps((prev) => ({
      ...prev,
      isDiscountsAndPriceSaved:
        savedTripsDiscounts.isInitialized &&
        savedDeliveryPrices.from1To25milesPrice > 0 &&
        savedDeliveryPrices.over25MilesPrice > 0,
    }));
  }, [savedTripsDiscounts, savedDeliveryPrices]);

  useEffect(() => {
    if (becomeHostSteps.isUserInfoSaved) {
      toggleOpenBlockUserInfo(false);
    }
    if (becomeHostSteps.isLicenseVerificationPassed) {
      toggleOpenBlockDriverLicense(false);
    }
    if (becomeHostSteps.isCarListeded) {
      toggleOpenBlockListingCar(false);
    }
    if (becomeHostSteps.isDiscountsAndPriceSaved) {
      toggleOpenBlockDiscountsAndPrice(false);
    }
  }, [
    becomeHostSteps,
    toggleOpenBlockUserInfo,
    toggleOpenBlockDriverLicense,
    toggleOpenBlockListingCar,
    toggleOpenBlockDiscountsAndPrice,
  ]);

  const stepsPassed = Object.values(becomeHostSteps).filter((i) => i === true).length;
  const stepsTotal = Object.values(becomeHostSteps).length;

  return (
    <>
      <PageTitle title={t("become_host.title")} />
      <div className="mt-5 flex flex-col justify-between xl:flex-row">
        <div>
          <BecomeHostProgress
            title={t("become_host.all_steps_car_sharing")}
            stepsPassed={stepsPassed}
            stepsTotal={stepsTotal}
          />

          <BecomeHostStep
            isOpen={false}
            toggleIsOpen={handleClickBlockConnectWallet}
            isEnabled={true}
            isPassed={becomeHostSteps.isWalletConnected}
            index={1}
            title={t("become_host.connect_wallet")}
          />

          <BecomeHostStep
            isOpen={openBlockUserInfo}
            toggleIsOpen={handleClickOpenBlockUserInfo}
            isEnabled={becomeHostSteps.isWalletConnected}
            isPassed={becomeHostSteps.isUserInfoSaved}
            index={2}
            title={t("become_host.enter_user_info")}
          >
            <div className="ml-10">
              <UserCommonInformationForm
                savedProfileSettings={savedProfileSettings}
                saveProfileSettings={saveProfileSettings}
              />
            </div>
          </BecomeHostStep>

          <BecomeHostStep
            isOpen={openBlockDriverLicense}
            toggleIsOpen={handleClickOpenBlockDriverLicense}
            isEnabled={becomeHostSteps.isUserInfoSaved}
            isPassed={becomeHostSteps.isLicenseVerificationPassed}
            index={3}
            title={t("become_host.driver_license")}
          >
            <div className="ml-10">
              <UserDriverLicenseVerification savedProfileSettings={savedProfileSettings} />
            </div>
          </BecomeHostStep>

          <BecomeHostStep
            isOpen={openBlockListingCar}
            toggleIsOpen={handleClickOpenBlockListingCar}
            isEnabled={becomeHostSteps.isLicenseVerificationPassed}
            isPassed={becomeHostSteps.isCarListeded}
            index={4}
            title={t("become_host.listing_car")}
          >
            <div className="ml-10 mt-4">
              <AddCar />
            </div>
          </BecomeHostStep>

          <BecomeHostStep
            isOpen={openBlockDiscountsAndPrice}
            toggleIsOpen={handleClickOpenBlockDiscountsAndPrice}
            isEnabled={becomeHostSteps.isCarListeded}
            isPassed={becomeHostSteps.isDiscountsAndPriceSaved}
            index={5}
            title={t("become_host.discounts_and_price")}
          >
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
          </BecomeHostStep>

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

function BecomeHostProgress({
  title,
  stepsPassed,
  stepsTotal,
}: {
  title: string;
  stepsPassed: number;
  stepsTotal: number;
}) {
  const progress = (stepsPassed * 100) / stepsTotal;

  return (
    <>
      <h3 className="pl-4 text-start">{title}</h3>
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
    </>
  );
}
function BecomeHostStep({
  isOpen,
  toggleIsOpen,
  index,
  title,
  isEnabled,
  isPassed,
  children,
}: {
  isOpen: boolean;
  toggleIsOpen: () => void;
  index: number;
  title: string;
  isEnabled: boolean;
  isPassed: boolean;
  children?: React.ReactNode;
}) {
  return (
    <>
      <div className="mt-5 flex w-fit cursor-pointer items-center justify-start pl-4" onClick={toggleIsOpen}>
        <div className={`flex text-lg ${isEnabled && !isPassed ? "text-white" : "text-[#FFFFFF70]"}`}>
          <CheckboxLight
            className="underline"
            checked={isPassed}
            checkedClassName={isEnabled && !isPassed ? "" : "border-[#FFFFFF70]"}
            checkMarkClassName={isEnabled && !isPassed ? "" : "border-[#FFFFFF70]"}
          />
          <span className={`pr-1 ${isEnabled && !isPassed ? "text-rentality-secondary" : "text-[#FFFFFF70]"}`}>
            {index}.
          </span>
          {title}
        </div>
        {children && (
          <Image
            src={isOpen ? arrowUpTurquoise : arrowDownTurquoise}
            alt=""
            className={`ml-1 ${isEnabled && !isPassed ? "" : "hidden"}`}
          />
        )}
      </div>
      {isOpen && <>{children}</>}
    </>
  );
}
