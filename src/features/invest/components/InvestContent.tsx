import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import RntButton from "@/components/common/rntButton";
import useGetInvestments from "@/hooks/guest/useGetInvestments";
import InvestCar from "@/features/invest/components/investCar";
import { useRouter } from "next/navigation";
import RntFilterSelect from "@/components/common/RntFilterSelect";
import { SortOptionKey } from "@/hooks/guest/useSearchCars";

type InvestContentProps = {
  isHost: boolean;
};

type FilterEnum = Record<string, string>; // Типизация для Enum

export default function InvestContent({ isHost }: InvestContentProps) {
  const { t } = useTranslation();
  const { investments, updateData, handleInvest, address, handleStartHosting, handleClaimIncome } = useGetInvestments();
  const router = useRouter();
  const handleCreateInvest = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await router.push("/host/create_invest");
  };

  const [filterForGuestBy, setFilterForGuestBy] = useState<string | undefined>(undefined);
  function isFilterForGuestKey(key: PropertyKey): key is SortOptionKey {
    return filterForGuest.hasOwnProperty(key);
  }
  // Получаем фильтры из переводов
  const filterForGuest: FilterEnum = t(isHost ? "invest.filter_for_host" : "invest.filter_for_guest", {
    returnObjects: true,
  }) as FilterEnum;
  // Генерируем Enum на основе ключей
  const FilterForGuestEnum = Object.keys(filterForGuest).reduce((acc, key) => {
    acc[key] = key;
    return acc;
  }, {} as FilterEnum);
  // Фильтрация инвестиций
  const filteredInvestments = investments.filter((value) => {
    if (!filterForGuestBy || filterForGuestBy === FilterForGuestEnum.all_assets) {
      return true; // Если "All assets", показываем все
    }

    switch (filterForGuestBy) {
      case FilterForGuestEnum.actually_listed:
        return value.investment.listed;

      case FilterForGuestEnum.my_investments:
        return value.investment.myTokens > 0;

      case FilterForGuestEnum.available_to_invest:
        return value.investment.investment.priceInUsd > value.investment.payedInUsd;

      case FilterForGuestEnum.ready_to_claim:
        return value.investment.myIncome > 0;

      case FilterForGuestEnum.fully_tokenized:
        return value.investment.investment.priceInUsd <= value.investment.payedInUsd;

      case FilterForGuestEnum.ready_for_listing:
        return value.investment.investment.priceInUsd <= value.investment.payedInUsd && !value.investment.listed;

      default:
        return true;
    }
  });

  return (
    <div className="mt-8">
      {isHost && (
        <RntButton className="mb-6 flex w-60 items-center justify-center" onClick={handleCreateInvest}>
          <div className="ml-0.5 flex">
            {t("invest.btn_create_investment")}
            <span className="ml-4">●</span>
          </div>
        </RntButton>
      )}

      <RntFilterSelect
        className="border-gradient w-60 justify-center border-0 bg-transparent text-lg text-rentality-secondary"
        id="invest_filter"
        value={filterForGuestBy ? filterForGuest[filterForGuestBy] : Object.values(filterForGuest ?? {})[0]}
        onChange={(e) => {
          const newDataKey = Object.entries(filterForGuest ?? {})[e.target.selectedIndex]?.[0];
          if (isFilterForGuestKey(newDataKey)) {
            setFilterForGuestBy(newDataKey);
          }
        }}
      >
        {Object.entries(filterForGuest ?? {}).map(([key, value]) => (
          <RntFilterSelect.Option key={key} value={value} />
        ))}
      </RntFilterSelect>

      {filteredInvestments.map((value) => (
        <InvestCar
          isHost={isHost}
          key={value.investment.investmentId as unknown as number}
          searchInfo={value}
          handleInvest={handleInvest}
          isCreator={value.investment.creator === address}
          handleStartHosting={handleStartHosting}
          handleClaimIncome={handleClaimIncome}
        />
      ))}
    </div>
  );
}
