import React, { MutableRefObject, memo, useState, useRef, useEffect } from "react";
import { AllowedChangeTripAction, TripInfo } from "@/model/TripInfo";
import RntButton from "../common/rntButton";
import { TripStatus } from "@/model/blockchain/schemas";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { isEmpty } from "@/utils/string";
import { TFunction } from "@/utils/i18n";
import AllowedActionsGuest from "./forms/AllowedActionsGuest";
import AllowedActionsHost from "./forms/AllowedActionsHost";
import ChangeStatusHostConfirmedForm from "./forms/ChangeStatusHostConfirmedForm";
import ChangeStatusGuestStartedForm from "./forms/ChangeStatusGuestStartedForm";
import ChangeStatusHostFinishingByHostForm from "./forms/ChangeStatusHostFinishingByHostForm";
import useFeatureFlags from "@/features/featureFlags/hooks/useFeatureFlags";
import CarPhotosUploadButton from "@/components/carPhotos/carPhotosUploadButton";
import { FEATURE_FLAGS } from "@/features/featureFlags/utils";
import { Result } from "@/model/utils/result";
import { deleteFilesByUrl, UploadedUrlList } from "@/features/filestore/pinata/utils";

function TripAdditionalActions({
  tripInfo,
  changeStatusCallback,
  disableButton,
  refForScrool,
  isHost,
  t,
}: {
  tripInfo: TripInfo;
  changeStatusCallback: (changeStatus: () => Promise<boolean>) => Promise<boolean>;
  disableButton: boolean;
  refForScrool?: MutableRefObject<HTMLDivElement>;
  isHost: boolean;
  t: TFunction;
}) {
  const defaultValues =
    tripInfo?.allowedActions?.length > 0
      ? tripInfo?.allowedActions[0].params.map((i) => {
          return i.value;
        })
      : [];
  const [inputParams, setInputParams] = useState<string[]>(defaultValues);
  const [confirmParams, setConfirmParams] = useState<boolean[]>([]);
  const { showDialog } = useRntDialogs();

  const carPhotosUploadButtonRef = useRef<any>(null);
  const { hasFeatureFlag } = useFeatureFlags();

  const [hasTripPhotosFeatureFlag, setHasTripPhotosFeatureFlag] = useState<boolean>(false);

  useEffect(() => {
    hasFeatureFlag(FEATURE_FLAGS.FF_TRIP_PHOTOS).then((hasTripPhotosFeatureFlag: boolean) => {
      setHasTripPhotosFeatureFlag(hasTripPhotosFeatureFlag);
    });
  }, []);

  const handleButtonClick = () => {
    if (tripInfo == null || tripInfo.allowedActions == null || tripInfo.allowedActions.length == 0) {
      return;
    }

    if (
      tripInfo.allowedActions[0].readonly &&
      (confirmParams.length != defaultValues.length || !confirmParams.every((i) => i === true))
    ) {
      showDialog(t("booked.confirm_full"));
      return;
    }

    if (
      inputParams.length > 0 &&
      inputParams.some((i, index) => tripInfo?.allowedActions[0]?.params[index]?.required === true && isEmpty(i))
    ) {
      showDialog(t("booked.input_full_odom"));
      return;
    }

    return changeStatusCallback(() => {
      return tripInfo.allowedActions[0].action(BigInt(tripInfo.tripId), inputParams, []);
    });
  };

  const onActionBtnClick = (action: AllowedChangeTripAction) => {
    if (action.params == null || action.params.length == 0) {
      hasFeatureFlag(FEATURE_FLAGS.FF_TRIP_PHOTOS).then((hasTripPhotosFeatureFlag: boolean) => {
        if (hasTripPhotosFeatureFlag) {
          carPhotosUploadButtonRef.current.saveUploadedFiles().then((result: Result<UploadedUrlList>) => {
            if (!result.ok || result.value.urls.length === 0) {
              showDialog(t("common.photos_required"));
            } else {
              changeStatusCallback(() => {
                return action.action(BigInt(tripInfo.tripId), [], []);
              }).then((isSuccess) => {
                if (!isSuccess) {
                  deleteFilesByUrl(result.value.urls);
                }
              });
            }
          });
        } else {
          changeStatusCallback(() => {
            return action.action(BigInt(tripInfo.tripId), [], []);
          });
        }
      });
    } else {
      hasFeatureFlag(FEATURE_FLAGS.FF_TRIP_PHOTOS).then((hasTripPhotosFeatureFlag: boolean) => {
        if (hasTripPhotosFeatureFlag) {
          carPhotosUploadButtonRef.current.saveUploadedFiles().then((result: Result<UploadedUrlList>) => {
            if (!result.ok || result.value.urls.length === 0) {
              showDialog(t("common.photos_required"));
            } else {
              handleButtonClick()?.then((isSuccess) => {
                if (!isSuccess) {
                  deleteFilesByUrl(result.value.urls);
                }
              });
            }
          });
        } else {
          handleButtonClick();
        }
      });
    }
  };

  if (isHost && tripInfo.status === TripStatus.Confirmed)
    return (
      <ChangeStatusHostConfirmedForm
        tripInfo={tripInfo}
        changeStatusCallback={changeStatusCallback}
        disableButton={disableButton}
        t={t}
        ref={refForScrool}
      />
    );

  if (isHost && (tripInfo.status === TripStatus.Started || tripInfo.status === TripStatus.CheckedInByHost))
    return (
      <ChangeStatusHostFinishingByHostForm
        tripInfo={tripInfo}
        changeStatusCallback={changeStatusCallback}
        disableButton={disableButton}
        t={t}
        ref={refForScrool}
      />
    );

  if (!isHost && tripInfo.status === TripStatus.Started)
    return (
      <ChangeStatusGuestStartedForm
        tripInfo={tripInfo}
        changeStatusCallback={changeStatusCallback}
        disableButton={disableButton}
        t={t}
        ref={refForScrool}
      />
    );

  return (
    <div className="flex flex-col px-8 pb-4 pt-2" ref={refForScrool}>
      <hr />
      <div id="trip-allowed-actions">
        <strong className="text-xl">
          {t("booked.confirm_data_to_change_status", {
            type: tripInfo.allowedActions[0].readonly ? "confirm" : "enter",
          })}
        </strong>
      </div>
      <div className="flex flex-col gap-4 py-4 fullHD:flex-row">
        {isHost ? (
          <AllowedActionsHost
            tripInfo={tripInfo}
            inputParams={inputParams}
            setInputParams={setInputParams}
            confirmParams={confirmParams}
            setConfirmParams={setConfirmParams}
            t={t}
          />
        ) : (
          <AllowedActionsGuest
            tripInfo={tripInfo}
            inputParams={inputParams}
            setInputParams={setInputParams}
            confirmParams={confirmParams}
            setConfirmParams={setConfirmParams}
          />
        )}
        <div>
          {hasTripPhotosFeatureFlag &&
            (tripInfo.status == TripStatus.CheckedInByHost || tripInfo.status == TripStatus.CheckedOutByGuest) && (
              <div className="flex w-full flex-col">
                <CarPhotosUploadButton
                  wrapperClassName="max-fullHD:m-auto"
                  ref={carPhotosUploadButtonRef}
                  isHost={isHost}
                  isStart={tripInfo.status == TripStatus.CheckedInByHost}
                  tripId={tripInfo.tripId}
                />
              </div>
            )}
        </div>
      </div>

      <div className="flex flex-row gap-4">
        {tripInfo.allowedActions.map((action) => {
          return (
            <RntButton
              key={action.text}
              className="px-4 max-fullHD:m-auto max-md:w-full"
              disabled={disableButton}
              onClick={() => {
                onActionBtnClick(action);
              }}
            >
              {action.text}
            </RntButton>
          );
        })}
      </div>
    </div>
  );
}

export default memo(TripAdditionalActions);
