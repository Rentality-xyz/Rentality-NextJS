// TODO Transate
import { useTranslation } from "react-i18next";
import useToggleState from "@/hooks/useToggleState";
import useTripsList from "@/hooks/guest/useTripsList";
import { dateRangeFormatShortMonthDateYear } from "@/utils/datetimeFormatters";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isEmpty } from "@/utils/string";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import useSaveTripInsurance from "@/features/insurance/hooks/useSaveTripInsurance";
import { ONE_TIME_INSURANCE_TYPE_ID } from "@/utils/constants";
import { addTripInsuranceFormSchema, AddTripInsuranceFormValues } from "../models/addTripInsuranceFormSchema";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import RntSelect from "@/components/common/rntSelect";
import RntInput from "@/components/common/rntInput";
import RntButton from "@/components/common/rntButton";
import UserInsurance from "./UserInsurance";
import { logger } from "@/utils/logger";

interface AddGuestInsuranceProps {}

export default function AddGuestInsurance({}: AddGuestInsuranceProps) {
  const { t } = useTranslation();
  const [isFormOpen, toggleFormOpen] = useToggleState(false);
  const { isLoading: isTripsLoading, trips, refetchData } = useTripsList(false);
  const { showInfo, showError, hideSnackbars } = useRntSnackbars();
  const { mutateAsync: saveTripInsurance } = useSaveTripInsurance();

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
      showInfo(t("common.info.success"));
      resetFormValues();
      refetchData();
    }
  }

  if (!isFormOpen)
    return (
      <>
        <h2 className="my-4">{t("insurance.please_enter_your_insurance")}</h2>
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
      <h2 className="my-4">{t("insurance.please_enter_your_insurance")}</h2>
      <div className="flex flex-col gap-4">
        <RntButtonTransparent
          onClick={() => {
            toggleFormOpen();
          }}
        >
          {t("common.hide")}
        </RntButtonTransparent>
        <hr />
        <UserInsurance />
        <hr />
        <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}>
          <div className="flex flex-row gap-4">
            <div className="flex w-full flex-row gap-4">
              <div className="my-auto w-1/2">
                <strong>One-Time trip insurance</strong>
              </div>
              <div className="w-1/2">
                {isTripsLoading ? (
                  "Loading..."
                ) : (
                  <Controller
                    name="selectedTripId"
                    control={control}
                    render={({ field }) => (
                      <RntSelect
                        className="w-full"
                        id="selectedTrip"
                        label="Trip:"
                        labelClassName="pl-4"
                        disabled={trips.length === 0}
                        value={field.value}
                        onChange={(e) => {
                          logger.info(`RntSelect onChange ${e.target.value}`);

                          field.onChange(Number(e.target.value));
                        }}
                        validationError={errors.selectedTripId?.message?.toString()}
                      >
                        {trips.length === 0 ? (
                          <option>No trips</option>
                        ) : (
                          <>
                            <option className="hidden" disabled selected>
                              Select trip
                            </option>
                            {trips.map((i) => (
                              <option
                                key={i.tripId}
                                value={i.tripId}
                              >{`${i.tripId} ${i.brand} ${i.model} ${i.year} ${dateRangeFormatShortMonthDateYear(i.tripStart, i.tripEnd)}`}</option>
                            ))}
                          </>
                        )}
                      </RntSelect>
                    )}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <RntInput
              id="companyName"
              label={"Insurance company name"}
              labelClassName="pl-4"
              {...register("companyName")}
              validationError={errors.companyName?.message?.toString()}
            />

            <RntInput
              id="policeNumber"
              label={"Insurance policy number"}
              labelClassName="pl-4"
              {...register("policeNumber")}
              validationError={errors.policeNumber?.message?.toString()}
            />
          </div>

          <RntInput
            id="comment"
            label={"Comment"}
            labelClassName="pl-4"
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
