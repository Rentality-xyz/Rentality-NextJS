import RntButton from "@/components/common/rntButton";
import RntCurrencySelect from "@/components/common/rntCurrencySelect";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import useFetchAvailableCurrencies, { AvailableCurrency } from "@/hooks/host/useFetchAvailableCurrencies";
import useSaveUserCurrency from "@/hooks/host/useSaveUserCurrency";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function UserCurrency({ userCurrency }: { userCurrency: AvailableCurrency }) {
  const { availableCurrency } = useFetchAvailableCurrencies();
  const { mutateAsync: saveUserCurrency } = useSaveUserCurrency();
  const [currency, setCurrency] = useState(userCurrency);
  const { showInfo, showSuccess, hideSnackbars, showError } = useRntSnackbars();

  const { t } = useTranslation();

  const handleSaveUserCurrency = async () => {
    showInfo(t("common.info.sign"));
    const result = await saveUserCurrency(currency);
    hideSnackbars();
    if (result.ok) {
      showSuccess(t("common.info.success"));
    } else {
      if (result.error.message === "NOT_ENOUGH_FUNDS") {
        showError(t("common.add_fund_to_wallet"));
      } else {
        showError(t("profile.save_currency_err"));
      }
    }
  };
  return (
    <div className="my-4 flex flex-col gap-4">
      <div className="mb-4 pl-[16px] text-lg">
        <strong>{t("profile.save_currency")}</strong>
      </div>
      <div className="flex flex-col gap-4">
        <RntCurrencySelect
          id={"select_filter_make"}
          isTransparentStyle={true}
          className="min-w-[17ch] justify-center bg-transparent pl-0 text-lg text-rentality-secondary"
          promptText={currency.name}
          value={currency?.name ?? ""}
          availableCurrency={availableCurrency}
          onCurrencySelect={(currency, name) => {
            setCurrency({ currency, name });
          }}
        />
        <RntButton onClick={handleSaveUserCurrency}>{t("profile.save_currency_btn")}</RntButton>
      </div>
    </div>
  );
}

export default UserCurrency;
