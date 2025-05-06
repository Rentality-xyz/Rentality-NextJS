import RntButton from "@/components/common/rntButton";
import RntCurrencySelect from "@/components/common/rntCurrencySelect";
import useFetchAvailableCurrencies from "@/hooks/host/useFetchAvailableCurrencies";
import useFetchUserCurrency from "@/hooks/host/useFetchUserCurrency";
import useSaveUserCurrency from "@/hooks/host/useSaveUserCurrency";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function UserCurrency() {
    const { availableCurrency } = useFetchAvailableCurrencies();
    const { userCurrency } = useFetchUserCurrency()
    const { mutateAsync: saveUserCurrency } = useSaveUserCurrency();
    const [ currency, setCurrency ] = useState(userCurrency)


      const { t } = useTranslation();

    const handleSaveUserCurrency  = async () => {
        await saveUserCurrency(currency)
    }
    return (
       <div className="my-4 flex flex-col gap-4">
       <div className="mb-4 pl-[16px] text-lg">
        <strong>{t('profile.save_currency')}</strong>
        </div>
        <div className="flex flex-col gap-4">
           <RntCurrencySelect
                id={"select_filter_make"}
                isTransparentStyle={true}
                className="min-w-[17ch] justify-center bg-transparent pl-0 text-lg text-rentality-secondary"
                promptText={currency.name}
                value={userCurrency?.name ?? ""}
                availableCurrency={availableCurrency}
                onCurrencySelect={(currency, name) => {
                  setCurrency({currency, name});
                }}
              />
            <RntButton onClick={handleSaveUserCurrency}>{t('profile.save_currency_btn')}</RntButton>
            </div>
        </div>

            )
}

export default UserCurrency;