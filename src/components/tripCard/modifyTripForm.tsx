import React, { memo, useEffect, useRef, useState } from "react";
import { TFunction } from "i18next";
import RntButtonTransparent from "../common/rntButtonTransparent";
import RntButton from "../common/rntButton";
import RntInputMultiline from "../common/rntInputMultiline";
import CarPhotosUploadButton from "@/components/carPhotos/carPhotosUploadButton";
import useFeatureFlags from "@/features/featureFlags/hooks/useFeatureFlags";
import { FEATURE_FLAGS } from "@/features/featureFlags/utils";
import { Result } from "@/model/utils/result";
import { deleteFilesByUrl } from "@/features/filestore/pinata/utils";

function ModifyTripForm({
  guestPhoneNumber,
  handleFinishTrip,
  handleCancel,
  t,
  tripId,
}: {
  guestPhoneNumber: string;
  handleFinishTrip: (messageToGuest: string) => Promise<boolean>;
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
    hasFeatureFlag(FEATURE_FLAGS.FF_TRIP_PHOTOS).then((hasTripPhotosFeatureFlag: boolean) => {
      setHasTripPhotosFeatureFlag(hasTripPhotosFeatureFlag);
    });
  }, []);

  const onFinishTripClick = () => {
    hasFeatureFlag(FEATURE_FLAGS.FF_TRIP_PHOTOS).then((hasTripPhotosFeatureFlag: boolean) => {
      if (hasTripPhotosFeatureFlag) {
        carPhotosUploadButtonRef.current.saveUploadedFiles().then((result: Result<{ urls: string[] }>) => {
          if (!result.ok || result.value.urls.length === 0) {
            setNoFilesUploadedError(true);
          } else {
            handleFinishTrip(messageToGuest).then((isSuccess) => {
              if (!isSuccess) {
                deleteFilesByUrl(result.value.urls);
              }
            });
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
        isTransparentStyle={true}
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
