import RntButton from "@/components/common/rntButton";
import RntInput from "@/components/common/rntInput";
import { memo } from "react";
import { useRntDialogs, useRntSnackbars } from "@/contexts/rntDialogsContext";
import { DeliveryPrices } from "@/hooks/host/useDeliveryPrices";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DeliveryPricesFormValues, deliveryPricesFormSchema } from "./deliveryPricesFormSchema";
import { useTranslation } from "react-i18next";
import { TransactionErrorCode, Result } from "@/model/utils/result";

function DeliveryPriceForm({
  savedDeliveryPrices,
  saveDeliveryPrices,
  isUserHasHostRole,
}: {
  savedDeliveryPrices: DeliveryPrices;
  saveDeliveryPrices: (newDeliveryPrices: DeliveryPrices) => Promise<Result<boolean, TransactionErrorCode>>;
  isUserHasHostRole: boolean;
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
  const { t } = useTranslation();

  async function onFormSubmit(formData: DeliveryPricesFormValues) {
    if (!isUserHasHostRole) {
      showDialog(t("profile.save_delivery_prices_err_is_not_host"));
      return;
    }

    showInfo(t("common.info.sign"));

    const result = await saveDeliveryPrices({
      from1To25milesPrice: formData.from1To25milesPrice,
      over25MilesPrice: formData.over25MilesPrice,
    });

    hideDialogs();
    hideSnackbars();

    if (result.ok) {
      showInfo(t("common.info.success"));
    } else {
      if (result.error === "NOT_ENOUGH_FUNDS") {
        showError(t("common.add_fund_to_wallet"));
      } else {
        showError(t("profile.save_delivery_prices_err"));
      }
    }
  }

  return (
    <form className="my-4 flex flex-col gap-4" onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}>
      <fieldset>
        <div className="mb-4 pl-[16px] text-lg">
          <strong>{t("profile.delivery_price")}</strong>
        </div>
        <div className="flex flex-col gap-4">
          <RntInput
            className="lg:w-60"
            labelClassName="pl-[18px]"
            id="from1To25milesPrice"
            label={t("profile.delivery_price_from_1_to_25_miles")}
            {...register("from1To25milesPrice", { valueAsNumber: true })}
            validationError={errors.from1To25milesPrice?.message?.toString()}
          />
          <RntInput
            className="lg:w-60"
            labelClassName="pl-[18px]"
            id="over25MilesPrice"
            label={t("profile.delivery_price_over_25_miles")}
            {...register("over25MilesPrice", { valueAsNumber: true })}
            validationError={errors.over25MilesPrice?.message?.toString()}
          />
        </div>
      </fieldset>

      <RntButton type="submit" className="mt-4" disabled={isSubmitting}>
        {t("profile.save_delivery_price")}
      </RntButton>
    </form>
  );
}

export default memo(DeliveryPriceForm);
