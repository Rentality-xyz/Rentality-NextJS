import RntButton from "@/components/common/rntButton";
import RntInput from "@/components/common/rntInput";
import { memo } from "react";
import { TFunction } from "@/utils/i18n";
import { useRntDialogs, useRntSnackbars } from "@/contexts/rntDialogsContext";
import { DeliveryPrices } from "@/hooks/host/useDeliveryPrices";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DeliveryPricesFormValues, deliveryPricesFormSchema } from "./deliveryPricesFormSchema";

function DeliveryPriceForm({
  savedDeliveryPrices,
  saveDeliveryPrices,
  isUserHasHostRole,
  t,
}: {
  savedDeliveryPrices: DeliveryPrices;
  saveDeliveryPrices: (newDeliveryPrices: DeliveryPrices) => Promise<boolean>;
  isUserHasHostRole: boolean;
  t: TFunction;
}) {
  const { showDialog, hideDialogs } = useRntDialogs();
  const { showInfo, showError, hideSnackbars } = useRntSnackbars();
  const { register, handleSubmit, formState } = useForm<DeliveryPricesFormValues>({
    defaultValues: {
      from1To25milesPrice: savedDeliveryPrices.from1To25milesPrice,
      over25MilesPrice: savedDeliveryPrices.over25MilesPrice,
    },
    resolver: zodResolver(deliveryPricesFormSchema),
  });
  const { errors, isSubmitting } = formState;

  const t_profile: TFunction = (name, options) => {
    return t("profile." + name, options);
  };

  async function onFormSubmit(formData: DeliveryPricesFormValues) {
    if (!isUserHasHostRole) {
      showDialog(t_profile("save_delivery_prices_err_is_not_host"));
      return;
    }

    try {
      showInfo(t("common.info.sign"));
      const result = await saveDeliveryPrices({
        from1To25milesPrice: formData.from1To25milesPrice,
        over25MilesPrice: formData.over25MilesPrice,
      });

      hideDialogs();
      hideSnackbars();
      if (!result) {
        throw new Error("Save trip delivery prices error");
      }
      showInfo(t("common.info.success"));
    } catch (e) {
      console.error("handleSubmit error:" + e);
      showError(t_profile("save_delivery_prices_err"));
      return;
    }
  }

  return (
    <form className="my-4 flex flex-col gap-4" onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}>
      <fieldset>
        <div className="mb-4 pl-[16px] text-lg">
          <strong>{t_profile("delivery_price")}</strong>
        </div>
        <div className="flex flex-col gap-4">
          <RntInput
            className="lg:w-60"
            labelClassName="pl-[18px]"
            id="from1To25milesPrice"
            label={t_profile("delivery_price_from_1_to_25_miles")}
            {...register("from1To25milesPrice", { valueAsNumber: true })}
            validationError={errors.from1To25milesPrice?.message?.toString()}
          />
          <RntInput
            className="lg:w-60"
            labelClassName="pl-[18px]"
            id="over25MilesPrice"
            label={t_profile("delivery_price_over_25_miles")}
            {...register("over25MilesPrice", { valueAsNumber: true })}
            validationError={errors.over25MilesPrice?.message?.toString()}
          />
        </div>
      </fieldset>

      <RntButton type="submit" className="mt-4" disabled={isSubmitting}>
        {t_profile("save_delivery_price")}
      </RntButton>
    </form>
  );
}

export default memo(DeliveryPriceForm);
