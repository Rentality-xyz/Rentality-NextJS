import RntButton from "@/components/common/rntButton";
import RntInput from "@/components/common/rntInput";
import { memo } from "react";
import { TFunction } from "@/utils/i18n";
import { useRntDialogs, useRntSnackbars } from "@/contexts/rntDialogsContext";
import { DiscountFormValues } from "@/hooks/host/useTripDiscounts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { tripDiscountsFormSchema, TripDiscountsFormValues } from "./tripDiscountsFormSchema";

function TripDiscountsForm({
  savedTripsDiscounts,
  saveTripsDiscounts,
  isUserHasHostRole,
  t,
}: {
  savedTripsDiscounts: DiscountFormValues;
  saveTripsDiscounts: (newTripsDiscounts: DiscountFormValues) => Promise<boolean>;
  isUserHasHostRole: boolean;
  t: TFunction;
}) {
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

  const t_profile: TFunction = (name, options) => {
    return t("profile." + name, options);
  };

  async function onFormSubmit(formData: TripDiscountsFormValues) {
    if (!isUserHasHostRole) {
      showDialog(t_profile("save_discount_err_is_not_host"));
      return;
    }

    try {
      showInfo(t("common.info.sign"));
      const result = await saveTripsDiscounts({
        discount3DaysAndMoreInPercents: formData.discount3DaysAndMoreInPercents,
        discount7DaysAndMoreInPercents: formData.discount7DaysAndMoreInPercents,
        discount30DaysAndMoreInPercents: formData.discount30DaysAndMoreInPercents,
      });

      hideDialogs();
      hideSnackbars();
      if (!result) {
        throw new Error("Save trip discounts error");
      }
      showInfo(t("common.info.success"));
    } catch (e) {
      console.error("handleSubmit error:" + e);
      showError(t_profile("save_discount_err"));
      return;
    }
  }

  return (
    <form className="my-4 flex flex-col gap-4" onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}>
      <fieldset>
        <div className="mb-4 pl-[16px] text-lg">
          <strong>{t_profile("discounts")}</strong>
        </div>
        <div className="flex flex-col gap-4">
          <RntInput
            className="lg:w-60"
            labelClassName="pl-[18px]"
            id="discount3DaysAndMoreInPercents"
            label={t_profile("discount_3_and_more")}
            {...register("discount3DaysAndMoreInPercents", { valueAsNumber: true })}
            validationError={errors.discount3DaysAndMoreInPercents?.message?.toString()}
          />
          <RntInput
            className="lg:w-60"
            labelClassName="pl-[18px]"
            id="discount7DaysAndMoreInPercents"
            label={t_profile("discount_7_and_more")}
            {...register("discount7DaysAndMoreInPercents", { valueAsNumber: true })}
            validationError={errors.discount7DaysAndMoreInPercents?.message?.toString()}
          />
          <RntInput
            className="lg:w-60"
            labelClassName="pl-[18px]"
            id="discount30DaysAndMoreInPercents"
            label={t_profile("discount_30_and_more")}
            {...register("discount30DaysAndMoreInPercents", { valueAsNumber: true })}
            validationError={errors.discount30DaysAndMoreInPercents?.message?.toString()}
          />
        </div>
      </fieldset>

      <RntButton type="submit" className="mt-4" disabled={isSubmitting}>
        {t_profile("save_discount")}
      </RntButton>
    </form>
  );
}

export default memo(TripDiscountsForm);
