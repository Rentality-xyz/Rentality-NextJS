import DeliveryPriceForm from "@/components/host/deliveryPriceForm";
import TripDiscountsForm from "@/components/host/tripDiscountsForm";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import RntButton from "@/components/common/rntButton";
import { CheckboxLight } from "@/components/common/rntCheckbox";
import Link from "next/link";
import { useAuth } from "@/contexts/auth/authContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { GatewayStatus, useGateway } from "@civic/ethereum-gateway-react";
import AddCar from "../vehicles/listings/add";
import { CivicProvider } from "@/contexts/web3/civicContext";
import UserCommonInformationForm from "@/features/profile/components/UserCommonInformationForm";
import UserDriverLicenseVerification from "@/features/profile/components/UserDriverLicenseVerification";
import { isEmpty } from "@/utils/string";
import useToggleState from "@/hooks/useToggleState";
import useFetchUserProfile from "@/features/profile/hooks/useFetchUserProfile";
import useSaveUserProfile from "@/features/profile/hooks/useSaveUserProfile";
import useFetchDeliveryPrices from "@/hooks/host/useFetchDeliveryPrices";
import useSaveDeliveryPrices from "@/hooks/host/useSaveDeliveryPrices";
import useFetchTripDiscounts from "@/hooks/host/useFetchTripDiscounts";
import useSaveTripDiscounts from "@/hooks/host/useSaveTripDiscounts";
import useFetchMyListings from "@/hooks/host/useFetchMyListings";

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
  const { isLoading: isLoadingUserProfile, data: userProfile } = useFetchUserProfile();
  const { mutateAsync: saveUserProfile } = useSaveUserProfile();

  const { isLoading: isLoadingMyListings, data: myListings } = useFetchMyListings();
  const { data: savedDeliveryPrices } = useFetchDeliveryPrices();
  const { mutateAsync: saveDeliveryPrices } = useSaveDeliveryPrices();
  const { data: savedTripsDiscounts } = useFetchTripDiscounts();
  const { mutateAsync: saveTripDiscounts } = useSaveTripDiscounts();
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
    if (isLoadingUserProfile) {
      setBecomeHostSteps((prev) => ({ ...prev, isUserInfoSaved: false }));
      return;
    }

    setBecomeHostSteps((prev) => ({
      ...prev,
      isUserInfoSaved: !isEmpty(userProfile.tcSignature) && userProfile.tcSignature !== "0x",
    }));
  }, [isLoadingUserProfile, userProfile]);

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
      isDiscountsAndPriceSaved: savedTripsDiscounts.isInitialized && savedDeliveryPrices.isInitialized,
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
              <UserCommonInformationForm userProfile={userProfile} saveUserProfile={saveUserProfile} />
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
              <UserDriverLicenseVerification />
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
              <TripDiscountsForm savedTripsDiscounts={savedTripsDiscounts} saveTripsDiscounts={saveTripDiscounts} />
              <DeliveryPriceForm savedDeliveryPrices={savedDeliveryPrices} saveDeliveryPrices={saveDeliveryPrices} />
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
          <Image src={"/images/tutorial_video.png"} width={628} height={412} alt="Tutorial video" className="ml-1" />
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
            src={isOpen ? "/images/icons/arrows/arrowUpTurquoise.svg" : "/images/icons/arrows/arrowDownTurquoise.svg"}
            alt=""
            width={20}
            height={20}
            className={`ml-1 ${isEnabled && !isPassed ? "" : "hidden"}`}
          />
        )}
      </div>
      {isOpen && <>{children}</>}
    </>
  );
}
