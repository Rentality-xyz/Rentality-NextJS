import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import RntButton from "@/components/common/rntButton";
import useGetInvestments from "@/features/invest/hooks/useFetchInvestments";
import InvestCar from "@/features/invest/components/InvestCar";
import { useRouter } from "next/navigation";
import RntFilterSelect from "@/components/common/RntFilterSelect";
import { SortOptionKey } from "@/hooks/guest/useSearchCars";
import useUserRole from "@/hooks/useUserRole";
import useClaimIncome from "../hooks/useClaimIncome";
import useStartHosting from "../hooks/useStartHosting";
import useInvest from "../hooks/useInvest";
import { emptyHostCarInfo } from "@/model/HostCarInfo";
import useFetchPlatformPercentage from "../hooks/useFetchPercentage";

type InvestContentProps = {};

type FilterEnum = Record<string, string>; // Типизация для Enum

function InvestPageContent({}: InvestContentProps) {
  const router = useRouter();
  const { userRole, isInvestManager } = useUserRole();
  const { data: investments } = useGetInvestments();
  const { mutateAsync: handleInvest, isPendingInvesting } = useInvest();
  const { mutateAsync: handleClaimIncome, isPending: isPendingClaimingIncome } = useClaimIncome();
  const { mutateAsync: handleStartHosting, isPending: isPendingStartingHosting } = useStartHosting();
  const [filterInvestBy, setFilterInvestBy] = useState<string | undefined>(undefined);
  const [openForm, setOpenForm] = useState(false);
   const {data: percentage} =  useFetchPlatformPercentage()
  const { t } = useTranslation();

  // Получаем фильтры из переводов
  const filterInvest: FilterEnum = useMemo(() => {
    return t(isInvestManager(userRole) ? "invest.filter_for_investor" : "invest.filter_for_user", {
      returnObjects: true,
    }) as FilterEnum;
  }, [isInvestManager, userRole, t]);

  function isFilterInvestKey(key: PropertyKey): key is SortOptionKey {
    return filterInvest.hasOwnProperty(key);
  }

  function handleCreateInvestClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    router.push("/host/create_invest");
  }

  // Фильтрация инвестиций
  const filteredInvestments = useMemo(() => {
    return investments.filter((value) => {
      if (!filterInvestBy || filterInvestBy === filterInvest.all_assets) {
        return true; // Если "All assets", показываем все
      }

      switch (filterInvestBy) {
        case filterInvest.actually_listed:
          return value.investment.listed;

        case filterInvest.my_investments:
          return value.investment.myTokens > 0;

        case filterInvest.available_to_invest:
          return value.investment.investment.priceInUsd > value.investment.payedInUsd;

        case filterInvest.ready_to_claim:
          return value.investment.myIncome > 0;

        case filterInvest.fully_tokenized:
          return value.investment.investment.priceInUsd <= value.investment.payedInUsd;

        case filterInvest.ready_for_listing:
          return value.investment.investment.priceInUsd <= value.investment.payedInUsd && !value.investment.listed;

        default:
          return true;
      }
    });
  }, [investments, filterInvestBy, filterInvest]);

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
            handleStartHosting={()=>handleStartHosting({investId: value.investment.investmentId, hostCarInfo: {...emptyHostCarInfo,pricePerDay: 10000}})}
            handleClaimIncome={handleClaimIncome}
          />
        ))}
      </div>
    </div>
  );
}

export default InvestPageContent;
