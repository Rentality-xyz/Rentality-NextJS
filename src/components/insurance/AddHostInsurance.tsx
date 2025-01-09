// TODO Transate
import { useTranslation } from "react-i18next";
import RntButtonTransparent from "../common/rntButtonTransparent";
import useToggleState from "@/hooks/useToggleState";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { Controller, useForm } from "react-hook-form";
import { addTripInsuranceFormSchema, AddTripInsuranceFormValues } from "./addTripInsuranceFormSchema";
import { ONE_TIME_INSURANCE_TYPE_ID } from "@/utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { isEmpty } from "@/utils/string";
import RntButton from "../common/rntButton";
import RntInput from "../common/rntInput";
import { dateRangeFormatShortMonthDateYear } from "@/utils/datetimeFormatters";
import RntSelect from "../common/rntSelect";
import useTripsList from "@/hooks/guest/useTripsList";
import useSaveHostTripInsurance from "@/hooks/host/useSaveHostTripInsurance";

interface AddHostInsuranceProps {
  onNewInsuranceAdded?: () => Promise<void>;
}

export default function AddHostInsurance({ onNewInsuranceAdded }: AddHostInsuranceProps) {
  const { t } = useTranslation();
  const [isFormOpen, toggleFormOpen] = useToggleState(false);
  const { isLoading: isTripsLoading, trips, refetchData } = useTripsList(true);
  const { showInfo, showError, hideSnackbars } = useRntSnackbars();
  const { saveTripInsurance } = useSaveHostTripInsurance();

  const {
    register,
    handleSubmit,
    formState,
    control,
    watch,
    setError,
    reset: resetFormValues,
  } = useForm<AddTripInsuranceFormValues>({
    defaultValues: {
      insuranceType: ONE_TIME_INSURANCE_TYPE_ID,
      comment: "",
    },
    resolver: zodResolver(addTripInsuranceFormSchema),
  });
  const { errors, isSubmitting } = formState;

  async function onFormSubmit(formData: AddTripInsuranceFormValues) {
    console.log("formData", JSON.stringify(formData, null, 2));
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
    const result = await saveTripInsurance(
      formData.insuranceType,
      formData.photos,
      formData.selectedTripId,
      formData.companyName,
      formData.policeNumber,
      formData.comment
    );
    hideSnackbars();

    if (!result.ok) {
      console.error("saveTripInsurance error: Save Guest Insurance info error");
      showError(t("profile.save_err"));
    } else {
      showInfo(t("common.info.success"));
      resetFormValues();
      refetchData();
      onNewInsuranceAdded !== undefined && onNewInsuranceAdded();
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
          {t("insurance.add_insurance")}
        </RntButtonTransparent>
        <hr />
        <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}>
          <div className="flex flex-row gap-4">
            <div className="flex w-1/2 flex-col gap-2">
              <h3>Insurance type</h3>

              <Controller
                name="insuranceType"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col">
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
            {isTripsLoading ? (
              "Loading..."
            ) : (
              <Controller
                name="selectedTripId"
                control={control}
                render={({ field }) => (
                  <RntSelect
                    className="w-1/2"
                    id="selectedTrip"
                    label="Trip:"
                    labelClassName="pl-4"
                    disabled={trips.length === 0}
                    value={field.value}
                    onChange={(e) => {
                      console.log(`RntSelect onChange ${e.target.value}`);

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
