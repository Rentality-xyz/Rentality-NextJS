import React, { forwardRef, useEffect, useRef, useState } from "react";
import { AllowedChangeTripAction, TripInfo } from "@/model/TripInfo";
import { TFunction } from "@/utils/i18n";
import RntButton from "@/components/common/rntButton";
import {
  changeStatusHostConfirmedFormSchema,
  ChangeStatusHostConfirmedFormValues,
} from "./changeStatusHostConfirmedFormSchema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import RntFuelLevelSelect from "@/components/common/RntFuelLevelSelect";
import CarPhotosUploadButton from "@/components/carPhotos/carPhotosUploadButton";
import useFeatureFlags from "@/features/featureFlags/hooks/useFeatureFlags";
import useUserMode from "@/hooks/useUserMode";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import useDIMOCarData from "@/features/dimo/hooks/useDIMOCarData";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import { FEATURE_FLAGS } from "@/features/featureFlags/utils";
import { Result } from "@/model/utils/result";
import { deleteFilesByUrl, UploadedUrlList } from "@/features/filestore/pinata/utils";

interface ChangeStatusHostConfirmedFormProps {
  tripInfo: TripInfo;
  changeStatusCallback: (action: AllowedChangeTripAction, changeStatus: () => Promise<boolean>) => Promise<boolean>;
  disableButton: boolean;
  t: TFunction;
}

const ChangeStatusHostConfirmedForm = forwardRef<HTMLDivElement, ChangeStatusHostConfirmedFormProps>(
  ({ tripInfo, changeStatusCallback, disableButton, t }, ref) => {
    const { panelData } = useDIMOCarData(tripInfo ? tripInfo.carId : 0);
    const { register, control, handleSubmit, formState, setValue } = useForm<ChangeStatusHostConfirmedFormValues>({
      defaultValues: {},
      resolver: zodResolver(changeStatusHostConfirmedFormSchema),
    });
    useEffect(() => {
      if (panelData) {
        setValue("fuelOrBatteryLevel", panelData.fuelOrBatteryLevel);
        setValue("odotemer", panelData.odotemer);
      }
    }, [panelData]);

    const { errors, isSubmitting } = formState;

    const { userMode, isHost } = useUserMode();
    const carPhotosUploadButtonRef = useRef<any>(null);

    const { hasFeatureFlag } = useFeatureFlags();
    const [hasTripPhotosFeatureFlag, setHasTripPhotosFeatureFlag] = useState<boolean>(false);

    const { showDialog } = useRntDialogs();

    useEffect(() => {
      hasFeatureFlag(FEATURE_FLAGS.FF_TRIP_PHOTOS).then((hasTripPhotosFeatureFlag: boolean) => {
        setHasTripPhotosFeatureFlag(hasTripPhotosFeatureFlag);
      });
    }, [hasFeatureFlag]);

    async function onFormSubmit(formData: ChangeStatusHostConfirmedFormValues) {
      let tripPhotosUrls: string[] = [];

      if (hasTripPhotosFeatureFlag) {
        const result: Result<UploadedUrlList> = await carPhotosUploadButtonRef.current.saveUploadedFiles();
        if (!result.ok || result.value.urls.length === 0) {
          showDialog(t("common.photos_required"));
          return;
        } else {
          tripPhotosUrls = result.value.urls;
        }
      }

      if (formData.odotemer === 0 || formData.fuelOrBatteryLevel === 0) {
        showDialog(t("booked.input_full_odom"));
        return;
      }

      changeStatusCallback(tripInfo.allowedActions[0], async () => {
        return tripInfo.allowedActions[0].action(
          BigInt(tripInfo.tripId),
          [
            formData.fuelOrBatteryLevel.toString(),
            formData.odotemer.toString(),
            formData.insuranceCompanyName ?? "",
            formData.insurancePolicyNumber ?? "",
          ],
          tripPhotosUrls
        );
      }).then((isSuccess) => {
        if (!isSuccess) {
          deleteFilesByUrl(tripPhotosUrls);
        }
      });
    }

    return (
      <div ref={ref}>
        <form
          className="flex flex-col px-8 pb-4 pt-2"
          onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}
        >
          <hr />
          <div id="trip-allowed-actions">
            <strong className="text-xl">
              {t("booked.confirm_data_to_change_status", {
                type: "enter",
              })}
            </strong>
          </div>

          <div className="flex flex-col gap-4 py-4 fullHD:grid fullHD:grid-cols-2">
            <div className="flex flex-col">
              <div className="flex flex-col">
                <Controller
                  name="fuelOrBatteryLevel"
                  control={control}
                  render={({ field, fieldState }) =>
                    panelData && panelData.fuelOrBatteryLevel !== 0 ? (
                      <RntInputTransparent
                        id="fuel_level"
                        label="Fuel or battery level, %"
                        value={panelData.fuelOrBatteryLevel}
                        disabled
                      />
                    ) : (
                      <RntFuelLevelSelect
                        id="fuel_level"
                        label="Fuel or battery level, %"
                        value={field.value}
                        onLevelChange={field.onChange}
                        validationError={fieldState.error?.message}
                      />
                    )
                  }
                />
                {panelData && panelData.odotemer !== 0 ? (
                  <RntInputTransparent id="Odometer" label="Odometer" value={panelData.odotemer} disabled />
                ) : (
                  <RntInputTransparent
                    className="py-2"
                    id="Odometer"
                    label="Odometer"
                    {...register("odotemer", { valueAsNumber: true })}
                    validationError={errors.odotemer?.message?.toString()}
                  />
                )}
              </div>
              <div className="flex flex-col">
                <RntInputTransparent
                  id="insurance_company_name"
                  label="Insurance company name"
                  {...register("insuranceCompanyName")}
                  validationError={errors.insuranceCompanyName?.message?.toString()}
                />
                <RntInputTransparent
                  className="py-2"
                  id="insurance_policy_number"
                  label="Insurance policy number"
                  {...register("insurancePolicyNumber")}
                  validationError={errors.insurancePolicyNumber?.message?.toString()}
                />
              </div>
            </div>
            {hasTripPhotosFeatureFlag && (
              <div className="flex flex-col fullHD:ml-auto">
                <CarPhotosUploadButton
                  wrapperClassName="max-fullHD:m-auto"
                  ref={carPhotosUploadButtonRef}
                  isHost={isHost(userMode)}
                  isStart={true}
                  tripId={tripInfo.tripId}
                />
              </div>
            )}
          </div>
          <div className="mt-2 flex flex-row justify-between gap-4">
            <RntButton type="submit" className="w-1/3 px-4 max-md:w-full" disabled={disableButton || isSubmitting}>
              Start
            </RntButton>
            <RntButton
              type="button"
              className="w-1/3 px-4 max-md:w-full"
              disabled={disableButton || isSubmitting}
              onClick={() => {
                changeStatusCallback(tripInfo.allowedActions[1], () => {
                  return tripInfo.allowedActions[1].action(BigInt(tripInfo.tripId), [], []);
                });
              }}
            >
              Reject
            </RntButton>
          </div>
        </form>
      </div>
    );
  }
);
ChangeStatusHostConfirmedForm.displayName = "ChangeStatusHostConfirmedForm";

export default ChangeStatusHostConfirmedForm;
