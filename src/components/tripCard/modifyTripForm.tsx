import React, { memo, useEffect, useRef, useState } from "react";
import { TFunction } from "i18next";
import RntButtonTransparent from "../common/rntButtonTransparent";
import RntButton from "../common/rntButton";
import RntInputMultiline from "../common/rntInputMultiline";
import CarPhotosUploadButton from "@/components/carPhotos/carPhotosUploadButton";
import { isHost } from "@/hooks/useUserMode";
import useFeatureFlags from "@/hooks/useFeatureFlags";
import { useRntDialogs } from "@/contexts/rntDialogsContext";

function ModifyTripForm({
  guestPhoneNumber,
  handleFinishTrip,
  handleCancel,
  t,
  tripId,
}: {
  guestPhoneNumber: string;
  handleFinishTrip: (messageToGuest: string) => Promise<void>;
  handleCancel: () => void;
  t: TFunction;
  tripId: number;
}) {
  const [messageToGuest, setMessageToGuest] = useState("");
  const telLink = `tel:${guestPhoneNumber}`;

  const { hasFeatureFlag } = useFeatureFlags();
  const [hasTripPhotosFeatureFlag, setHasTripPhotosFeatureFlag] = useState<boolean>(false);
  const [noFilesUploadedError, setNoFilesUploadedError] = useState(false);

  const carPhotosUploadButtonRef = useRef<any>(null);

  useEffect(() => {
    hasFeatureFlag("FF_TRIP_PHOTOS").then((hasTripPhotosFeatureFlag: boolean) => {
      setHasTripPhotosFeatureFlag(hasTripPhotosFeatureFlag);
    });
  }, []);

  const onFinishTripClick = () => {
    hasFeatureFlag("FF_TRIP_PHOTOS").then((hasTripPhotosFeatureFlag: boolean) => {
      if (hasTripPhotosFeatureFlag) {
        carPhotosUploadButtonRef.current.saveUploadedFiles().then((tripPhotosUrls: string[]) => {
          if (tripPhotosUrls.length === 0) {
            setNoFilesUploadedError(true);
          } else {
            handleFinishTrip(messageToGuest);
          }
        });
      } else {
        handleFinishTrip(messageToGuest);
      }
    });
  };

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <p className="text-rentality-secondary">Finish the trip without guest confirmation</p>
      <p>You can complete the trip without guest confirmation and the car will be available for booking.</p>
      <p>You will not receive the earnings until the guest confirms the completion of the trip.</p>

      <RntInputMultiline
        className="mt-6"
        id="message"
        rows={2}
        label="Message to guest (optional)"
        value={messageToGuest}
        onChange={(e) => setMessageToGuest(e.target.value)}
      />
      <RntButton className="my-1 w-full" onClick={onFinishTripClick}>
        Finish the trip without guest confirmation
      </RntButton>
      <a className="w-full" href={telLink}>
        <RntButtonTransparent className="my-1 w-full">Contact to guest</RntButtonTransparent>
      </a>
      {hasTripPhotosFeatureFlag && (
        <>
          {noFilesUploadedError && <div>{t("common.photos_required")}</div>}
          <CarPhotosUploadButton
            ref={carPhotosUploadButtonRef}
            isHost={true}
            isStart={false}
            tripId={tripId}
            isSimpleButton={true}
          />
        </>
      )}
      <RntButtonTransparent className="my-1 w-full" onClick={handleCancel}>
        Cancel
      </RntButtonTransparent>
    </div>
  );
}

export default memo(ModifyTripForm);
