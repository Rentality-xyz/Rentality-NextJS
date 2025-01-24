import React, { forwardRef, useEffect, useMemo, useRef, useState  } from "react";
import { TripInfo } from "@/model/TripInfo";
import { TFunction } from "@/utils/i18n";
import RntButton from "@/components/common/rntButton";
import RntInput from "@/components/common/rntInput";
import {
  changeStatusHostConfirmedFormSchema,
  ChangeStatusHostConfirmedFormValues,
} from "./changeStatusHostConfirmedFormSchema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import RntFuelLevelSelect from "@/components/common/RntFuelLevelSelect";
import useDIMOCarData from "@/hooks/useDIMOCarData";
import CarPhotosUploadButton from "@/components/carPhotos/carPhotosUploadButton";
import useFeatureFlags from "@/hooks/useFeatureFlags";
import useUserMode, { isHost } from "@/hooks/useUserMode";
import { useRntDialogs } from "@/contexts/rntDialogsContext";

interface ChangeStatusHostConfirmedFormProps {
  tripInfo: TripInfo;
  changeStatusCallback: (changeStatus: () => Promise<boolean>) => Promise<void>;
  disableButton: boolean;
  t: TFunction;
}

const ChangeStatusHostConfirmedForm = forwardRef<HTMLDivElement, ChangeStatusHostConfirmedFormProps>(
  ({ tripInfo, changeStatusCallback, disableButton, t }, ref) => {
    const {panelData,getCarPanelParams} = useDIMOCarData(tripInfo ? tripInfo.carId : 0);
    const { register, control, handleSubmit, formState, setValue } = useForm<ChangeStatusHostConfirmedFormValues>({
      defaultValues: {},
      resolver: zodResolver(changeStatusHostConfirmedFormSchema),
    });
    useEffect(() => {
     if(panelData) {
      setValue("fuelOrBatteryLevel", panelData.fuelOrBatteryLevel);
      setValue("odotemer", panelData.odotemer);
     }
  }, [panelData]);

    const { errors, isSubmitting } = formState;

    const { userMode } = useUserMode();
    const carPhotosUploadButtonRef = useRef<any>(null);

    const { hasFeatureFlag } = useFeatureFlags();
    const [ hasTripPhotosFeatureFlag, setHasTripPhotosFeatureFlag ] = useState<boolean>(false);

    const { showDialog } = useRntDialogs();

    useEffect(() => {
      hasFeatureFlag("FF_TRIP_PHOTOS").then((hasTripPhotosFeatureFlag: boolean) => {
        setHasTripPhotosFeatureFlag(hasTripPhotosFeatureFlag);
      });
    },[]);

    async function onFormSubmit(formData: ChangeStatusHostConfirmedFormValues) {

        let tripPhotosUrls: string[] = [];

        if (hasTripPhotosFeatureFlag) {
          tripPhotosUrls = await carPhotosUploadButtonRef.current.saveUploadedFiles();
          if(tripPhotosUrls.length === 0){
            showDialog(t("common.photos_required"));
            return;
          }
        }
        changeStatusCallback(async () => {
          return tripInfo.allowedActions[0].action(BigInt(tripInfo.tripId), [
              formData.fuelOrBatteryLevel.toString(),
              formData.odotemer.toString(),
              formData.insuranceCompanyName ?? "",
              formData.insurancePolicyNumber ?? "",
            ], tripPhotosUrls);
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

          <div className="flex flex-row gap-4 py-4">
            <div className="flex w-full flex-col md:flex-1 lg:w-1/3 lg:flex-none">
              <Controller
                name="fuelOrBatteryLevel"
                control={control}
                render={({ field, fieldState }) => (
                  (panelData && panelData.fuelOrBatteryLevel !== 0) ? (
                    <RntInput
                    className="py-2"
                    id="fuel_level"
                    label="Fuel or battery level, %"
                    value={panelData.fuelOrBatteryLevel}
                    disabled
                  />
                  ) : (
                    <RntFuelLevelSelect
                      className="py-2"
                      id="fuel_level"
                      label="Fuel or battery level, %"
                      value={field.value}
                      onLevelChange={field.onChange}
                      validationError={fieldState.error?.message}
                    />
                  )
                )}
              />
              {panelData && panelData.odotemer !== 0? (
                <RntInput
                  className="py-2"
                  id="Odometer"
                  label="Odometer"
                  value={panelData.odotemer}
                  disabled
                />
              ): (
              <RntInput
                className="py-2"
                id="Odometer"
                label="Odometer"
                {...register("odotemer", { valueAsNumber: true })}
                validationError={errors.odotemer?.message?.toString()}
              />)}
            </div>
            <div className="flex w-full flex-col md:flex-1 lg:w-1/3 lg:flex-none">
              <RntInput
                className="py-2"
                id="insurance_company_name"
                label="Insurance company name"
                {...register("insuranceCompanyName")}
                validationError={errors.insuranceCompanyName?.message?.toString()}
              />
              <RntInput
                className="py-2"
                id="insurance_policy_number"
                label="Insurance policy number"
                {...register("insurancePolicyNumber")}
                validationError={errors.insurancePolicyNumber?.message?.toString()}
              />
            </div>
            { hasTripPhotosFeatureFlag && (
              <div className="flex w-full flex-col md:flex-1 lg:w-1/3 lg:flex-none">
                <CarPhotosUploadButton
                  ref={carPhotosUploadButtonRef}
                  isHost={isHost(userMode)}
                  isStart={true}
                  tripId={tripInfo.tripId}
                />
              </div>
            )}
          </div>
          <div className="flex flex-row gap-4">
            <RntButton type="submit" className="h-16 px-4 max-md:w-full" disabled={disableButton || isSubmitting }>
              Start
            </RntButton>
            <RntButton
              type="button"
              className="h-16 px-4 max-md:w-full"
              disabled={disableButton || isSubmitting}
              onClick={() => {
                changeStatusCallback(() => {
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
