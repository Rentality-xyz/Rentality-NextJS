import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import RntButton from "@/components/common/rntButton";
import useFetchInvestments from "@/features/invest/hooks/useFetchInvestments";
import InvestCar from "@/features/invest/components/InvestCar";
import { useRouter } from "next/navigation";
import RntFilterSelect from "@/components/common/RntFilterSelect";
import useUserRole from "@/hooks/useUserRole";
import useClaimIncome from "../hooks/useClaimIncome";
import useInvest from "../hooks/useInvest";
import { Ok } from "@/model/utils/result";
import { useFilters } from "@/hooks/useFilters";
import {
  investForInvestorFilters,
  InvestForInvestorFilterValueKey,
  investForUserFilters,
  InvestForUserFilterValueKey,
} from "../models/filters";
import { LocalizedFilterOption } from "@/model/filters";

type InvestContentProps = {};

function InvestPageContent({}: InvestContentProps) {
  const router = useRouter();
  const { userRole, isInvestManager } = useUserRole();
  const { data: investments } = useFetchInvestments();
  const { mutateAsync: handleInvest, isPendingInvesting } = useInvest();
  const { mutateAsync: handleClaimIncome } = useClaimIncome();
  const localizedFilters = useFilters(isInvestManager(userRole) ? investForInvestorFilters : investForUserFilters);
  const [selectedFilter, setSelectedFilter] = useState<
    | LocalizedFilterOption<InvestForUserFilterValueKey>
    | LocalizedFilterOption<InvestForInvestorFilterValueKey>
    | undefined
  >(undefined);
  const { t } = useTranslation();

  function handleCreateInvestClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    router.push("/host/invest/create");
  }

  async function handleStartHosting(investmentId: number) {
    router.push(`/host/invest/start-hosting/${investmentId}`);
    return Ok(true);
  }

  const filteredInvestments = useMemo(() => {
    return investments.filter((value) => {
      if (!selectedFilter || selectedFilter.key === "all_assets") {
        return true;
      }

      switch (selectedFilter.key) {
        case "actually_listed":
          return value.investment.listed;
        case "my_investments":
          return value.investment.myTokens > 0;
        case "available_to_invest":
          return value.investment.investment.priceInCurrency > value.investment.payedInCurrency;
        case "ready_to_claim":
          return value.investment.myIncome > 0;
        case "fully_tokenized":
          return value.investment.investment.priceInCurrency <= value.investment.payedInCurrency;
        case "ready_for_listing":
          return (
            value.investment.investment.priceInCurrency <= value.investment.payedInCurrency && !value.investment.listed
          );
        default:
          return true;
      }
    });
  }, [investments, selectedFilter]);

  return (
    <div className="mt-8">
      {isInvestManager(userRole) && (
        <RntButton className="mb-6 flex w-60 items-center justify-center" onClick={handleCreateInvestClick}>
          {t("invest.btn_create_investment")}
        </RntButton>
      )}
      <RntFilterSelect
        className="btn_input_border-gradient w-60 justify-center bg-transparent text-lg text-rentality-secondary"
        id="invest_filter"
        value={selectedFilter ? selectedFilter.text : (localizedFilters.options[0]?.text ?? "")}
        onChange={(e) => {
          const selectedOption = localizedFilters.options[e.target.selectedIndex];
          if (selectedOption) {
            setSelectedFilter(selectedOption);
          }
        }}
      >
        {localizedFilters.options.map(({ key, text }) => (
          <RntFilterSelect.Option key={key} value={text}>
            {text}
          </RntFilterSelect.Option>
        ))}
      </RntFilterSelect>
      <div className="mt-6 grid grid-cols-1 gap-4 2xl:grid-cols-2">
        {filteredInvestments.map((value) => (
          <InvestCar
            isHost={isInvestManager(userRole)}
            key={value.investment.investmentId}
            searchInfo={value}
            handleInvest={(amount, investId) => handleInvest({ amount, investId })}
            isPendingInvesting={isPendingInvesting(value.investment.investmentId)}
            handleStartHosting={handleStartHosting}
            handleClaimIncome={handleClaimIncome}
          />
        ))}
      </div>
    </div>
  );
}

export default InvestPageContent;
