import RntButton from "@/components/common/rntButton";
import RntInput from "@/components/common/rntInput";
import { FormEvent, memo, useState } from "react";
import { TFunction } from "@/utils/i18n";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { useRouter } from "next/router";
import { DeliveryPrices } from "@/hooks/host/useDeliveryPrices";
import { isEmpty } from "@/utils/string";

type DeliveryPricesFormValues = {
  from1To25milesPrice: string;
  over25MilesPrice: string;
};

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
  const router = useRouter();
  const [enteredFormData, setEnteredFormData] = useState<DeliveryPricesFormValues>({
    from1To25milesPrice: savedDeliveryPrices.from1To25milesPrice.toString(),
    over25MilesPrice: savedDeliveryPrices.over25MilesPrice.toString(),
  });
  const { showInfo, showError, showDialog, hideDialogs } = useRntDialogs();

  const t_profile: TFunction = (name, options) => {
    return t("profile." + name, options);
  };

  const errors = getErrors(enteredFormData);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.name;
    setEnteredFormData({ ...enteredFormData, [name]: e.target.value });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isUserHasHostRole) {
      showDialog(t_profile("save_delivery_prices_err_is_not_host"));
      return;
    }

    const isValid = Object.keys(errors).length === 0;

    if (!isValid) {
      showDialog(t("common.info.fill_fields"));
      return;
    }

    try {
      showInfo(t("common.info.sign"));
      const result = await saveDeliveryPrices({
        from1To25milesPrice: Number(enteredFormData.from1To25milesPrice),
        over25MilesPrice: Number(enteredFormData.over25MilesPrice),
      });

      hideDialogs();
      if (!result) {
        throw new Error("Save trip discounts error");
      }
      showInfo(t("common.info.success"));
    } catch (e) {
      console.error("handleSubmit error:" + e);
      showError(t_profile("save_delivery_prices_err"));
      return;
    }
  }

  function getErrors(formData: DeliveryPricesFormValues) {
    const result: { [key: string]: string } = {};

    if (isEmpty(formData.from1To25milesPrice) || !isFinite(Number(formData.from1To25milesPrice)))
      result.from1To25milesPrice = t_profile("pls_number");
    if (isEmpty(formData.over25MilesPrice) || !isFinite(Number(formData.over25MilesPrice)))
      result.over25MilesPrice = t_profile("pls_number");

    return result;
  }

  return (
    <form className="my-4 flex flex-col gap-4" onSubmit={handleSubmit}>
      <fieldset>
        <div className="text-lg mb-4">
          <strong>{t_profile("delivery_price")}</strong>
        </div>
        <div className="flex flex-col gap-4">
          <RntInput
            className="lg:w-60"
            id="from1To25milesPrice"
            label={t_profile("delivery_price_from_1_to_25_miles")}
            value={enteredFormData.from1To25milesPrice}
            onChange={handleChange}
          />
          <RntInput
            className="lg:w-60"
            id="over25MilesPrice"
            label={t_profile("delivery_price_over_25_miles")}
            value={enteredFormData.over25MilesPrice}
            onChange={handleChange}
          />
        </div>
      </fieldset>

      <RntButton type="submit" className="mt-4">
        {t_profile("save_delivery_price")}
      </RntButton>
    </form>
  );
}

export default memo(DeliveryPriceForm);
