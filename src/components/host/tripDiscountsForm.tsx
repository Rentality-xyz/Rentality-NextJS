import RntButton from "@/components/common/rntButton";
import RntInput from "@/components/common/rntInput";
import { FormEvent, memo, useState } from "react";
import { TFunction } from "@/utils/i18n";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { useRouter } from "next/router";
import { DiscountFormValues } from "@/hooks/host/useTripDiscounts";

function TripDiscountsForm({
  savedTripsDiscounts,
  saveTripsDiscounts,
  t,
}: {
  savedTripsDiscounts: DiscountFormValues;
  saveTripsDiscounts: (newTripsDiscounts: DiscountFormValues) => Promise<boolean>;
  t: TFunction;
}) {
  const router = useRouter();
  const [enteredFormData, setEnteredFormData] = useState<DiscountFormValues>(savedTripsDiscounts);
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
      const result = await saveTripsDiscounts(enteredFormData);

      hideDialogs();
      if (!result) {
        throw new Error("Save trip discounts error");
      }
      showInfo(t("common.info.success"));
      router.reload();
    } catch (e) {
      console.error("handleSubmit error:" + e);
      showError(t_profile("save_discount_err"));
      return;
    }
  }

  function getErrors(formData: DiscountFormValues) {
    const result: { [key: string]: string } = {};

    if (formData.discount3DaysAndMoreInPercents === 0) result.firstName = t_profile("pls_number_percent");
    if (formData.discount7DaysAndMoreInPercents === 0) result.firstName = t_profile("pls_number_percent");
    if (formData.discount30DaysAndMoreInPercents === 0) result.firstName = t_profile("pls_number_percent");

    return result;
  }

  return (
    <form className="my-4 flex flex-col gap-4" onSubmit={handleSubmit}>
      <fieldset>
        <div className="text-lg mb-4">
          <strong>{t_profile("discounts")}</strong>
        </div>
        <div className="flex flex-col gap-4">
          <RntInput
            className="lg:w-60"
            id="discount3DaysAndMoreInPercents"
            label={t_profile("discount_3_and_more")}
            value={enteredFormData.discount3DaysAndMoreInPercents}
            onChange={handleChange}
          />
          <RntInput
            className="lg:w-60"
            id="discount7DaysAndMoreInPercents"
            label={t_profile("discount_7_and_more")}
            value={enteredFormData.discount7DaysAndMoreInPercents}
            onChange={handleChange}
          />
          <RntInput
            className="lg:w-60"
            id="discount30DaysAndMoreInPercents"
            label={t_profile("discount_30_and_more")}
            value={enteredFormData.discount30DaysAndMoreInPercents}
            onChange={handleChange}
          />
        </div>
      </fieldset>

      <RntButton type="submit" className="mt-4">
        {t_profile("save_discount")}
      </RntButton>
    </form>
  );
}

export default memo(TripDiscountsForm);
