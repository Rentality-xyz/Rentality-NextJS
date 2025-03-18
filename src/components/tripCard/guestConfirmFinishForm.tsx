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
  handleFinishTrip: () => Promise<boolean>;
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
    hasFeatureFlag(FEATURE_FLAGS.FF_TRIP_PHOTOS).then((hasTripPhotosFeatureFlag: boolean) => {
      setHasTripPhotosFeatureFlag(hasTripPhotosFeatureFlag);
    });
  }, []);

  const onConfirmClick = () => {
    hasFeatureFlag(FEATURE_FLAGS.FF_TRIP_PHOTOS).then((hasTripPhotosFeatureFlag: boolean) => {
      if (hasTripPhotosFeatureFlag) {
        carPhotosUploadButtonRef.current.saveUploadedFiles().then((result: Result<{ urls: string[] }>) => {
          if (!result.ok || result.value.urls.length === 0) {
            setNoFilesUploadedError(true);
          } else {
            handleFinishTrip().then((isSuccess) => {
              if (!isSuccess) {
                deleteFilesByUrl(result.value.urls);
              }
            });
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
