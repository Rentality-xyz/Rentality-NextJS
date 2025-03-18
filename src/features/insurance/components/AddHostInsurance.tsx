// TODO Transate
import { useTranslation } from "react-i18next";
import useToggleState from "@/hooks/useToggleState";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { Controller, useForm } from "react-hook-form";
import { addTripInsuranceFormSchema, AddTripInsuranceFormValues } from "../models/addTripInsuranceFormSchema";
import { ONE_TIME_INSURANCE_TYPE_ID } from "@/utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { isEmpty } from "@/utils/string";
import { dateRangeFormatShortMonthDateYear } from "@/utils/datetimeFormatters";
import useTripsList from "@/hooks/guest/useTripsList";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import RntButton from "@/components/common/rntButton";
import useSaveTripInsurance from "../hooks/useSaveTripInsurance";
import RntFilterSelect from "@/components/common/RntFilterSelect";
import * as React from "react";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import { logger } from "@/utils/logger";

interface AddHostInsuranceProps {}

export default function AddHostInsurance({}: AddHostInsuranceProps) {
  const [isFormOpen, toggleFormOpen] = useToggleState(false);
  const { isLoading: isTripsLoading, trips, refetchData } = useTripsList(true);
  const { mutateAsync: saveTripInsurance } = useSaveTripInsurance();
  const { showInfo, showError, showSuccess, hideSnackbars } = useRntSnackbars();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState,
    control,
    setError,
    reset: resetFormValues,
  } = useForm<AddTripInsuranceFormValues>({
    defaultValues: {
      insuranceType: ONE_TIME_INSURANCE_TYPE_ID,
    },
    resolver: zodResolver(addTripInsuranceFormSchema),
  });
  const { errors, isSubmitting } = formState;

  async function onFormSubmit(formData: AddTripInsuranceFormValues) {
    let isValid = true;

    if (formData.selectedTripId === undefined) {
      setError("selectedTripId", { message: "value is required", type: "required" });
      isValid = false;
    }
    if (isEmpty(formData.companyName)) {
      setError("companyName", { message: "value is required", type: "required" });
      isValid = false;
    }
    if (isEmpty(formData.policeNumber)) {
      setError("policeNumber", { message: "value is required", type: "required" });
      isValid = false;
    }
    if (!isValid) return;

    showInfo(t("common.info.sign"));

    const result = await saveTripInsurance({
      insuranceType: formData.insuranceType,
      tripId: formData.selectedTripId,
      companyName: formData.companyName,
      policeNumber: formData.policeNumber,
      comment: formData.comment,
    });

    hideSnackbars();

    if (!result.ok) {
      logger.error("saveTripInsurance error: Save Guest Insurance info error");
      showError(t("profile.save_err"));
    } else {
      showSuccess(t("common.info.success"));
      resetFormValues();
      refetchData();
    }
  }

  if (!isFormOpen)
    return (
      <>
        <h2 className="my-4 pl-4">{t("insurance.please_enter_your_insurance")}</h2>
        <RntButtonTransparent
          onClick={() => {
            toggleFormOpen();
          }}
        >
          {t("insurance.add_insurance")}
        </RntButtonTransparent>
      </>
    );

  return (
    <>
      <h2 className="my-4 pl-4">{t("insurance.please_enter_your_insurance")}</h2>
      <div className="flex flex-col gap-4">
        <RntButtonTransparent
          onClick={() => {
            toggleFormOpen();
          }}
        >
          {t("common.hide")}
        </RntButtonTransparent>
        <hr />
        <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}>
          <div className="flex w-full flex-col gap-4 sm:flex-row">
            <div className="flex w-full flex-col gap-2 sm:w-1/2">
              <h3 className="pl-4">Insurance type</h3>
              <Controller
                name="insuranceType"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col pl-4">
                    <div className="flex gap-2">
                      <input
                        type="radio"
                        id={ONE_TIME_INSURANCE_TYPE_ID}
                        name="insurance"
                        value={ONE_TIME_INSURANCE_TYPE_ID}
                        checked={field.value === ONE_TIME_INSURANCE_TYPE_ID}
                        onChange={field.onChange}
                      />
                      <label htmlFor="oneTimeInsurance">One-Time trip insurance</label>
                    </div>
                  </div>
                )}
              />
            </div>
            <div className="w-full sm:w-1/2">
              {isTripsLoading ? (
                "Loading..."
              ) : (
                <Controller
                  name="selectedTripId"
                  control={control}
                  render={({ field }) => (
                    <RntFilterSelect
                      className="w-full"
                      id="selectedTrip"
                      label="Trip:"
                      placeholder="Select trip"
                      disabled={trips.length === 0}
                      value={field.value}
                      onChange={(e) => {
                        logger.info(`RntSelect onChange ${e.target.value}`);

                        field.onChange(Number(e.target.value));
                      }}
                      validationError={errors.selectedTripId?.message?.toString()}
                    >
                      {trips.length === 0 ? (
                        <RntFilterSelect.Option key="key-host-insurance-1" value="No trips">
                          No trips
                        </RntFilterSelect.Option>
                      ) : (
                        trips.map((i) => (
                          <RntFilterSelect.Option key={i.tripId} value={String(i.tripId)}>
                            {`${i.tripId} ${i.brand} ${i.model} ${i.year} ${dateRangeFormatShortMonthDateYear(i.tripStart, i.tripEnd)}`}
                          </RntFilterSelect.Option>
                        ))
                      )}
                    </RntFilterSelect>
                  )}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <RntInputTransparent
              id="companyName"
              label={"Insurance company name"}
              {...register("companyName")}
              validationError={errors.companyName?.message?.toString()}
            />

            <RntInputTransparent
              id="policeNumber"
              label={"Insurance policy number"}
              {...register("policeNumber")}
              validationError={errors.policeNumber?.message?.toString()}
            />
          </div>

          <RntInputTransparent
            id="comment"
            label={"Comment"}
            {...register("comment")}
            validationError={errors.comment?.message?.toString()}
          />
          <RntButton className="mt-4" type="submit" disabled={isSubmitting}>
            Save
          </RntButton>
        </form>
        <hr />
      </div>
    </>
  );
}
