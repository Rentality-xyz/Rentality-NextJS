import { useTranslation } from "react-i18next";
import { Avatar } from "@mui/material";
import RntFilterSelect from "@/components/common/RntFilterSelect";
import { DialogActions } from "@/utils/dialogActions";
import React, { useState } from "react";
import { ContractAllowedCurrencyDTO } from "@/model/blockchain/schemas";
import { ethers } from "ethers";

type ContractAllowedCurrencyDTOWithBalance = ContractAllowedCurrencyDTO & { balance: bigint; };

export function SelectCurrencyDialogForm({
  currencies,
  hideDialogHandler,
  createTripHandler,
}: {
  currencies: ContractAllowedCurrencyDTOWithBalance[];
  hideDialogHandler: () => void;
  createTripHandler: (paymentCurrency: string) => void;
}) {
  const { t } = useTranslation();
  const [selectedCurrency, setSelectedCurrency] = useState<ContractAllowedCurrencyDTOWithBalance>(currencies[0]);

  return (
    <div className="mx-auto w-full max-w-md px-6 py-5 text-center">
      <div className="mb-4 text-base text-rentality-secondary">{t("search_page.errors.no_money")}</div>

      <RntFilterSelect
        id="select_currency"
        className="w-full justify-center bg-transparent pl-0 text-lg text-rentality-secondary"
        isTransparentStyle
        value={`${selectedCurrency?.name} (${Number.parseFloat(ethers.formatUnits(selectedCurrency?.balance, selectedCurrency?.decimals)).toFixed(4)})`}
        placeholder={selectedCurrency?.name}
        onChange={(e) => {
          const selected = currencies.find((c) => c.name === e.target.value);
          if (selected) setSelectedCurrency(selected);
        }}
      >
        {currencies.map((currency) => (
          <RntFilterSelect.Option
            key={`currency-${currency.tokenAddress}`}
            value={currency.name}
            data-id={currency.tokenAddress}
          >
            {currency.name}
          </RntFilterSelect.Option>
        ))}
      </RntFilterSelect>

      <div className="mt-6 flex flex-row items-center justify-center gap-3">
        <div>{DialogActions.Button(t("common.cancel"), hideDialogHandler)}</div>
        <div>
          {DialogActions.Button(t("common.pay"), () => {
            hideDialogHandler();
            if (!selectedCurrency) {
              return;
            }
            createTripHandler(selectedCurrency?.tokenAddress);
          })}
        </div>
      </div>
    </div>
  );
}
