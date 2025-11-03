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
import AddCar from "../vehicles/listings/add";
import { CivicProvider } from "@/contexts/web3/civicContext";
import UserCommonInformationForm from "@/features/profile/components/UserCommonInformationForm";
import { isEmpty } from "@/utils/string";
import useToggleState from "@/hooks/useToggleState";
import useFetchUserProfile from "@/features/profile/hooks/useFetchUserProfile";
import useSaveUserProfile from "@/features/profile/hooks/useSaveUserProfile";
import useFetchDeliveryPrices from "@/hooks/host/useFetchDeliveryPrices";
import useSaveDeliveryPrices from "@/hooks/host/useSaveDeliveryPrices";
import useFetchTripDiscounts from "@/hooks/host/useFetchTripDiscounts";
import useSaveTripDiscounts from "@/hooks/host/useSaveTripDiscounts";
import useFetchMyListings from "@/hooks/host/useFetchMyListings";
import useSaveNewCar from "@/hooks/host/useSaveNewCar";
import CarEditForm from "@/components/host/carEditForm/carEditForm";

const TUTORIAL_YOUTUBE_URL = "https://www.youtube.com/embed/CWu89sKcYVI?si=l2xEG3SWV0DC5KHe"

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

  const [openBlockListingCar, toggleOpenBlockListingCar] = useToggleState(false);
  const handleClickOpenBlockListingCar = () => {
    if (!becomeHostSteps.isCarListeded) {
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
    if (becomeHostSteps.isCarListeded) {
      toggleOpenBlockListingCar(false);
    }
    if (becomeHostSteps.isDiscountsAndPriceSaved) {
      toggleOpenBlockDiscountsAndPrice(false);
    }
  }, [
    becomeHostSteps,
    toggleOpenBlockUserInfo,
    toggleOpenBlockListingCar,
    toggleOpenBlockDiscountsAndPrice,
  ]);

  const stepsPassed = Object.values(becomeHostSteps).filter((i) => i).length;
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
            isOpen={openBlockListingCar}
            toggleIsOpen={handleClickOpenBlockListingCar}
            isEnabled={becomeHostSteps.isUserInfoSaved}
            isPassed={becomeHostSteps.isCarListeded}
            index={3}
            title={t("become_host.listing_car")}
          >
            <div className="ml-10 mt-4">
              <AddCarBecomeHost />
            </div>
          </BecomeHostStep>

          <BecomeHostStep
            isOpen={openBlockDiscountsAndPrice}
            toggleIsOpen={handleClickOpenBlockDiscountsAndPrice}
            isEnabled={becomeHostSteps.isCarListeded}
            isPassed={becomeHostSteps.isDiscountsAndPriceSaved}
            index={4}
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
          <div className="ml-1 rounded-2xl overflow-hidden" style={{ width: 628, height: 412 }}>
            <iframe
              className="w-full h-full"
              src={TUTORIAL_YOUTUBE_URL}
              title="Tutorial video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
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

function AddCarBecomeHost() {
  const { mutateAsync: saveNewCar } = useSaveNewCar();
  const { t } = useTranslation();

  return (
    <>
      <CarEditForm
        editMode="newCar"
        isFromBecomeHost={true}
        saveCarInfo={async (hostCarInfo) => {
          return await saveNewCar(hostCarInfo);
        }}
        t={t}
      />
    </>
  );
}
