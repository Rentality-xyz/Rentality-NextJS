import React, { memo, useEffect, useRef, useState } from "react";
import { TFunction } from "i18next";
import RntButtonTransparent from "../common/rntButtonTransparent";
import RntButton from "../common/rntButton";
import RntInputMultiline from "../common/rntInputMultiline";
import CarPhotosUploadButton from "@/components/carPhotos/carPhotosUploadButton";
import useFeatureFlags from "@/hooks/useFeatureFlags";
import { useRntDialogs } from "@/contexts/rntDialogsContext";

function GuestConfirmFinishForm({
  hostPhoneNumber,
  messageFromHost,
  handleFinishTrip,
  handleCancel,
  t,
  tripId,
}: {
  hostPhoneNumber: string;
  messageFromHost: string;
  handleFinishTrip: () => Promise<void>;
  handleCancel: () => void;
  t: TFunction;
  tripId: number;
}) {
  const telLink = `tel:${hostPhoneNumber}`;

  const { hasFeatureFlag } = useFeatureFlags();
  const [hasTripPhotosFeatureFlag, setHasTripPhotosFeatureFlag] = useState<boolean>(false);
  const [noFilesUploadedError, setNoFilesUploadedError] = useState(false);

  const carPhotosUploadButtonRef = useRef<any>(null);

  useEffect(() => {
    hasFeatureFlag("FF_TRIP_PHOTOS").then((hasTripPhotosFeatureFlag: boolean) => {
      setHasTripPhotosFeatureFlag(hasTripPhotosFeatureFlag);
    });
  }, []);

  const onConfirmClick = () => {
    hasFeatureFlag("FF_TRIP_PHOTOS").then((hasTripPhotosFeatureFlag: boolean) => {
      if (hasTripPhotosFeatureFlag) {
        carPhotosUploadButtonRef.current.saveUploadedFiles().then((tripPhotosUrls: string[]) => {
          if (tripPhotosUrls.length === 0) {
            setNoFilesUploadedError(true);
          } else {
            handleFinishTrip();
          }
        });
      } else {
        handleFinishTrip();
      }
    });
  };

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <p className="text-rentality-secondary">Confirm finish trip</p>
      <p>Host finished the trip without guest confirmation.</p>
      <p>Please confirm finish trip or contact the host.</p>

      <RntInputMultiline
        isTransparentStyle={true}
        className="mt-6"
        id="message"
        readOnly={true}
        rows={2}
        label="Message from your Host"
        value={messageFromHost}
      />
      <RntButton className="my-1 w-full" onClick={onConfirmClick}>
        I confirm finish trip
      </RntButton>
      <a className="w-full" href={telLink}>
        <RntButtonTransparent className="my-1 w-full">Contact to host</RntButtonTransparent>
      </a>
      {hasTripPhotosFeatureFlag && (
        <>
          {noFilesUploadedError && <div>{t("common.photos_required")}</div>}
          <CarPhotosUploadButton
            ref={carPhotosUploadButtonRef}
            isHost={false}
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

export default memo(GuestConfirmFinishForm);
