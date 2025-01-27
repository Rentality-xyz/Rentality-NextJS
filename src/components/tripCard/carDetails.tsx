import { dateFormatShortMonthDate } from "@/utils/datetimeFormatters";
import { TripInfo } from "@/model/TripInfo";
import UserAvatarWithName from "@/components/common/userAvatarWithName";
import React, { memo } from "react";
import { TripStatus } from "@/model/blockchain/schemas";
import { TFunction } from "@/utils/i18n";
import RntButtonTransparent from "../common/rntButtonTransparent";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import CarDetailsVerificationDialog from "./CarDetailsVerificationDialog";
import Image from "next/image";
import imgDimoSynced from "@/images/img_dimo_synced.svg";

function CarDetails({
  tripInfo,
  isHost,
  t,
  confirmCarDetails,
}: {
  tripInfo: TripInfo;
  isHost: boolean;
  t: TFunction;
  confirmCarDetails?: (tridId: number) => Promise<void>;
}) {
  const { showCustomDialog, hideDialogs } = useRntDialogs();

  const rejectedByHost = tripInfo.rejectedBy.toLowerCase() === tripInfo.host.walletAddress.toLowerCase();
  const rejectedByText = rejectedByHost
    ? isHost
      ? t("common.you")
      : tripInfo.host.name ?? t("common.host")
    : isHost
      ? tripInfo.guest.name ?? t("common.guest")
      : t("common.you");
  const otherUserPhotoUrl = isHost ? tripInfo.guest.photoUrl : tripInfo.host.photoUrl;
  const otherUserName = isHost ? tripInfo.guest.name : tripInfo.host.name;

  const handleConfirmCarDetailsClick = async () => {
    if (!confirmCarDetails) {
      console.error("handleConfirmCarDetailsClick error: confirmCarDetails is undefined");
      return;
    }

    showCustomDialog(
      <CarDetailsVerificationDialog
        handleConfirmCarDetailsClick={async () => {
          await confirmCarDetails(tripInfo.tripId);
          hideDialogs();
        }}
        handleCancelClick={hideDialogs}
      />
    );
  };

  return (
    <div id="trip-main-info" className="flex w-full flex-col justify-between gap-4">
      <div className="flex flex-col">
        <div className="grid-cols-[2fr_1fr] items-center justify-between max-xl:grid">
          <strong className="text-xl">{`${tripInfo.brand} ${tripInfo.model} ${tripInfo.year}`}</strong>
          {tripInfo.dimoTokenId !== 0 && (
            <div className="xl:hidden">
              <Image src={imgDimoSynced} alt="" className="w-[140px]" />
            </div>
          )}
        </div>
        <div>{tripInfo.licensePlate}</div>
        {tripInfo.status === TripStatus.Rejected && tripInfo.rejectedDate !== undefined ? (
          <div className="mt-2">
            {t("booked.cancelled_on", {
              rejected: rejectedByText,
              date: dateFormatShortMonthDate(tripInfo.rejectedDate),
            })}
          </div>
        ) : null}
        <div className="mt-4 flex flex-col">
          <div>
            <strong className="text-lg">{t("booked.total")}</strong>
          </div>
          <div>${tripInfo.totalDayPriceInUsd}</div>
        </div>
      </div>
      {tripInfo.dimoTokenId !== 0 && (
        <div className="max-xl:hidden">
          <Image src={imgDimoSynced} alt="" className="w-[160px]" />
        </div>
      )}
      <div className="flex flex-row justify-between">
        <UserAvatarWithName
          photoUrl={otherUserPhotoUrl}
          userName={otherUserName}
          label={isHost ? "YOUR GUEST" : "HOSTED BY"}
        />

        {tripInfo.status === TripStatus.Closed && !tripInfo.isCarDetailsConfirmed && confirmCarDetails && (
          <RntButtonTransparent
            className="mr-8 flex h-12 w-12 flex-row items-center justify-center gap-2"
            onClick={handleConfirmCarDetailsClick}
          >
            <i className="fi fi-br-hexagon-check pt-2 text-3xl text-green-500"></i>
          </RntButtonTransparent>
        )}
      </div>
    </div>
  );
}

export default memo(CarDetails);
