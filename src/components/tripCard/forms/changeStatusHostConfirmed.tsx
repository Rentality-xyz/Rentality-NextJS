import React, { forwardRef } from "react";
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

interface ChangeStatusHostConfirmedProps {
  tripInfo: TripInfo;
  changeStatusCallback: (changeStatus: () => Promise<boolean>) => Promise<void>;
  disableButton: boolean;
  t: TFunction;
}

const ChangeStatusHostConfirmed = forwardRef<HTMLDivElement, ChangeStatusHostConfirmedProps>(
  ({ tripInfo, changeStatusCallback, disableButton, t }, ref) => {
    const { register, control, handleSubmit, formState } = useForm<ChangeStatusHostConfirmedFormValues>({
      defaultValues: {},
      resolver: zodResolver(changeStatusHostConfirmedFormSchema),
    });
    const { errors, isSubmitting } = formState;

    async function onFormSubmit(formData: ChangeStatusHostConfirmedFormValues) {
      changeStatusCallback(() => {
        return tripInfo.allowedActions[0].action(BigInt(tripInfo.tripId), [
          formData.fuelOrBatteryLevel.toString(),
          formData.odotemer.toString(),
          formData.insuranceCompanyName ?? "",
          formData.insurancePolicyNumber ?? "",
        ]);
      });
    }

    return (
      <div ref={ref}>
        <form
          className="flex flex-col px-8 pt-2 pb-4"
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

          <div className="flex flex-row flex-wrap gap-12 py-4 ">
            <div className="w-full flex flex-col md:flex-1 lg:flex-none lg:w-1/3">
              <Controller
                name="fuelOrBatteryLevel"
                control={control}
                render={({ field }) => (
                  <RntFuelLevelSelect
                    className="py-2"
                    id="fuel_level"
                    label="Fuel or battery level, %"
                    value={field.value}
                    onLevelChange={field.onChange}
                    validationError={errors.fuelOrBatteryLevel?.message?.toString()}
                  />
                )}
              />
              <RntInput
                className="py-2"
                id="Odometer"
                label="Odometer"
                {...register("odotemer", { valueAsNumber: true })}
                validationError={errors.odotemer?.message?.toString()}
              />
            </div>
            <div className="w-full flex flex-col md:flex-1 lg:flex-none lg:w-1/3">
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
          </div>

          <div className="flex flex-row gap-4">
            <RntButton type="submit" className="max-md:w-full h-16 px-4" disabled={disableButton || isSubmitting}>
              Start
            </RntButton>
            <RntButton
              type="button"
              className="max-md:w-full h-16 px-4"
              disabled={disableButton || isSubmitting}
              onClick={() => {
                changeStatusCallback(() => {
                  return tripInfo.allowedActions[1].action(BigInt(tripInfo.tripId), []);
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
ChangeStatusHostConfirmed.displayName = "ChangeStatusHostConfirmed";

export default ChangeStatusHostConfirmed;
