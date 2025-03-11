import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import RntButton from "@/components/common/rntButton";
import useGetInvestments from "@/features/invest/hooks/useGetInvestments";
import InvestCar from "@/features/invest/components/InvestCar";
import { useRouter } from "next/navigation";
import RntFilterSelect from "@/components/common/RntFilterSelect";
import { SortOptionKey } from "@/hooks/guest/useSearchCars";
import useUserRole from "@/hooks/useUserRole";

type InvestContentProps = {};

type FilterEnum = Record<string, string>; // Типизация для Enum

function InvestPageContent({}: InvestContentProps) {
  const { userRole, isInvestManager } = useUserRole();
  const { t } = useTranslation();
  const {
    investments,
    handleInvest,
    isPendingInvesting,
    address,
    handleStartHosting,
    isPendingStartingHosting,
    handleClaimIncome,
    isPendingClaimingIncome,
  } = useGetInvestments();
  const router = useRouter();
  const handleCreateInvest = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await router.push("/host/create_invest");
  };

  const [filterInvestBy, setFilterInvestBy] = useState<string | undefined>(undefined);
  function isFilterInvestKey(key: PropertyKey): key is SortOptionKey {
    return filterInvest.hasOwnProperty(key);
  }
  // Получаем фильтры из переводов
  const filterInvest: FilterEnum = t(
    isInvestManager(userRole) ? "invest.filter_for_investor" : "invest.filter_for_user",
    {
      returnObjects: true,
    }
  ) as FilterEnum;
  // Генерируем Enum на основе ключей
  const FilterInvestEnum = Object.keys(filterInvest).reduce((acc, key) => {
    acc[key] = key;
    return acc;
  }, {} as FilterEnum);
  // Фильтрация инвестиций
  const filteredInvestments = investments.filter((value) => {
    if (!filterInvestBy || filterInvestBy === FilterInvestEnum.all_assets) {
      return true; // Если "All assets", показываем все
    }

    switch (filterInvestBy) {
      case FilterInvestEnum.actually_listed:
        return value.investment.listed;

      case FilterInvestEnum.my_investments:
        return value.investment.myTokens > 0;

      case FilterInvestEnum.available_to_invest:
        return value.investment.investment.priceInUsd > value.investment.payedInUsd;

      case FilterInvestEnum.ready_to_claim:
        return value.investment.myIncome > 0;

      case FilterInvestEnum.fully_tokenized:
        return value.investment.investment.priceInUsd <= value.investment.payedInUsd;

      case FilterInvestEnum.ready_for_listing:
        return value.investment.investment.priceInUsd <= value.investment.payedInUsd && !value.investment.listed;

      default:
        return true;
    }
  });

  return (
    <div className="mt-8">
      {isInvestManager(userRole) && (
        <RntButton className="mb-6 flex w-60 items-center justify-center" onClick={handleCreateInvest}>
          {t("invest.btn_create_investment")}
        </RntButton>
      )}

      <RntFilterSelect
        className="btn_input_border-gradient w-60 justify-center bg-transparent text-lg text-rentality-secondary"
        id="invest_filter"
        value={filterInvestBy ? filterInvest[filterInvestBy] : Object.values(filterInvest ?? {})[0]}
        onChange={(e) => {
          const newDataKey = Object.entries(filterInvest ?? {})[e.target.selectedIndex]?.[0];
          if (isFilterInvestKey(newDataKey)) {
            setFilterInvestBy(newDataKey);
          }
        }}
      >
        {Object.entries(filterInvest ?? {}).map(([key, value]) => (
          <RntFilterSelect.Option key={key} value={value}>
            {value}
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
            isCreator={value.investment.creator === address}
            handleStartHosting={handleStartHosting}
            handleClaimIncome={handleClaimIncome}
          />
        ))}
      </div>
    </div>
  );
}

export default InvestPageContent;
