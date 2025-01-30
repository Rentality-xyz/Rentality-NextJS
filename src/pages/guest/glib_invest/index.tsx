import React, { useState } from "react";
import Layout from "@/components/layout/layout";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/utils/i18n";
import InvestCarGlib from "@/components/investment/investCarGlib";
import useGetInvestments from "@/hooks/guest/useGetInvestments";

export default function Invest() {
  const [requestSending] = useState<boolean>(false);
  const [selectedCarID, setSelectedCarID] = useState<number | null>(null);

  const { t } = useTranslation();
  const { investments, updateData, handleInvest, address, handleStartHosting, handleClaimIncome } = useGetInvestments();

  const t_page: TFunction = (path, options) => {
    return t("search_page." + path, options);
  };
  const t_errors: TFunction = (name, options) => {
    return t_page("errors." + name, options);
  };

  return (
    <>
      {investments.map((value) => {
        return (
          <InvestCarGlib
            key={value.investment.investmentId as unknown as number}
            searchInfo={value}
            disableButton={requestSending}
            isSelected={selectedCarID == (value.investment.investmentId as unknown as number)}
            setSelected={(carID: number) => {
              setSelectedCarID(carID == selectedCarID ? null : carID);
            }}
            t={t_page}
            handleInvest={handleInvest}
            isCreator={value.investment.creator === address}
            handleStartHosting={handleStartHosting}
            handleClaimIncome={handleClaimIncome}
          />
        );
      })}
    </>
  );
}
