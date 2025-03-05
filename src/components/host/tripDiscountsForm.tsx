import RntButton from "@/components/common/rntButton";
import RntInput from "@/components/common/rntInput";
import { memo } from "react";
import { useRntDialogs, useRntSnackbars } from "@/contexts/rntDialogsContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { tripDiscountsFormSchema, TripDiscountsFormValues } from "./tripDiscountsFormSchema";
import { Result } from "@/model/utils/result";
import { useTranslation } from "react-i18next";
import useUserRole from "@/hooks/useUserRole";
import { TripDiscounts } from "@/hooks/host/useFetchTripDiscounts";

function TripDiscountsForm({
  savedTripsDiscounts,
  saveTripsDiscounts,
}: {
  savedTripsDiscounts: TripDiscounts;
  saveTripsDiscounts: (newTripsDiscounts: TripDiscounts) => Promise<Result<boolean, Error>>;
}) {
  const { userRole } = useUserRole();
  const { showDialog, hideDialogs } = useRntDialogs();
  const { showInfo, showError, hideSnackbars } = useRntSnackbars();
  const { register, handleSubmit, formState } = useForm<TripDiscountsFormValues>({
    defaultValues: {
      discount3DaysAndMoreInPercents: savedTripsDiscounts.discount3DaysAndMoreInPercents,
      discount7DaysAndMoreInPercents: savedTripsDiscounts.discount7DaysAndMoreInPercents,
      discount30DaysAndMoreInPercents: savedTripsDiscounts.discount30DaysAndMoreInPercents,
    },
    resolver: zodResolver(tripDiscountsFormSchema),
  });
  const { errors, isSubmitting } = formState;
  const { t } = useTranslation();

  async function onFormSubmit(formData: TripDiscountsFormValues) {
    if (userRole !== "Host") {
      showDialog(t("profile.save_discount_err_is_not_host"));
      return;
    }

    showInfo(t("common.info.sign"));

    const result = await saveTripsDiscounts({
      discount3DaysAndMoreInPercents: formData.discount3DaysAndMoreInPercents,
      discount7DaysAndMoreInPercents: formData.discount7DaysAndMoreInPercents,
      discount30DaysAndMoreInPercents: formData.discount30DaysAndMoreInPercents,
      isInitialized: true,
    });

    hideDialogs();
    hideSnackbars();

    if (result.ok) {
      showInfo(t("common.info.success"));
    } else {
      if (result.error.message === "NOT_ENOUGH_FUNDS") {
        showError(t("common.add_fund_to_wallet"));
      } else {
        showError(t("profile.save_discount_err"));
      }
    }
  }

  return (
    <form className="my-4 flex flex-col gap-4" onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}>
      <fieldset>
        <div className="mb-4 pl-[16px] text-lg">
          <strong>{t("profile.discounts")}</strong>
        </div>
        <div className="flex flex-col gap-4">
          <RntInput
            className="lg:w-60"
            labelClassName="pl-[18px]"
            id="discount3DaysAndMoreInPercents"
            label={t("profile.discount_3_and_more")}
            {...register("discount3DaysAndMoreInPercents", { valueAsNumber: true })}
            validationError={errors.discount3DaysAndMoreInPercents?.message?.toString()}
          />
          <RntInput
            className="lg:w-60"
            labelClassName="pl-[18px]"
            id="discount7DaysAndMoreInPercents"
            label={t("profile.discount_7_and_more")}
            {...register("discount7DaysAndMoreInPercents", { valueAsNumber: true })}
            validationError={errors.discount7DaysAndMoreInPercents?.message?.toString()}
          />
          <RntInput
            className="lg:w-60"
            labelClassName="pl-[18px]"
            id="discount30DaysAndMoreInPercents"
            label={t("profile.discount_30_and_more")}
            {...register("discount30DaysAndMoreInPercents", { valueAsNumber: true })}
            validationError={errors.discount30DaysAndMoreInPercents?.message?.toString()}
          />
        </div>
      </fieldset>

      <RntButton type="submit" className="mt-4" disabled={isSubmitting}>
        {t("profile.save_discount")}
      </RntButton>
    </form>
  );
}

export default memo(TripDiscountsForm);
