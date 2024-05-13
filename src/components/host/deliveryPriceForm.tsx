import RntButton from "@/components/common/rntButton";
import RntInput from "@/components/common/rntInput";
import { FormEvent, memo, useState } from "react";
import { TFunction } from "@/utils/i18n";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { useRouter } from "next/router";
import { DeliveryPricesFormValues } from "@/hooks/host/useDeliveryPrices";

function DeliveryPriceForm({
  savedDeliveryPrices,
  saveDeliveryPrices,
  t,
}: {
  savedDeliveryPrices: DeliveryPricesFormValues;
  saveDeliveryPrices: (newDeliveryPrices: DeliveryPricesFormValues) => Promise<boolean>;
  t: TFunction;
}) {
  const router = useRouter();
  const [enteredFormData, setEnteredFormData] = useState<DeliveryPricesFormValues>(savedDeliveryPrices);
  const { showInfo, showError, showDialog, hideDialogs } = useRntDialogs();

  const t_profile: TFunction = (name, options) => {
    return t("profile." + name, options);
  };

  const errors = getErrors(enteredFormData);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.name;
    setEnteredFormData({ ...enteredFormData, [name]: Number(e.target.value) ?? 0 });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const isValid = Object.keys(errors).length === 0;

    if (!isValid) {
      showDialog(t("common.info.fill_fields"));
      return;
    }

    try {
      showInfo(t("common.info.sign"));
      const result = await saveDeliveryPrices(enteredFormData);

      hideDialogs();
      if (!result) {
        throw new Error("Save trip discounts error");
      }
      showInfo(t("common.info.success"));
      router.reload();
    } catch (e) {
      console.error("handleSubmit error:" + e);
      showError(t_profile("save_delivery_prices_err"));
      return;
    }
  }

  function getErrors(formData: DeliveryPricesFormValues) {
    const result: { [key: string]: string } = {};

    if (formData.from1To25milesPrice === 0) result.firstName = t_profile("pls_number");
    if (formData.over25MilesPrice === 0) result.firstName = t_profile("pls_number");

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
