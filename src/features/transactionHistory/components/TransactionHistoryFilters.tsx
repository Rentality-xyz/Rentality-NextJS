import React, { useState } from "react";
import { dateToHtmlDateFormat } from "@/utils/datetimeFormatters";
import moment from "moment";
import { TripStatus } from "@/model/blockchain/schemas";
import { getTripStatusTextFromStatus } from "@/model/TripInfo";
import { useTranslation } from "react-i18next";
import { TransactionHistoryFiltersType } from "@/features/transactionHistory/hooks/useTransactionHistory";
import RntInput from "@/components/common/rntInput";
import RntSelect from "@/components/common/rntSelect";
import RntButton from "@/components/common/rntButton";
import RntFilterSelect from "@/components/common/RntFilterSelect";

const allTripStatuses = Object.values(TripStatus).map((value) => {
  return { id: value, text: getTripStatusTextFromStatus(value) };
});

type TransactionHistoryFiltersProps = {
  defaultFilters?: TransactionHistoryFiltersType;
  onApply: (filters: TransactionHistoryFiltersType) => Promise<void>;
};

function TransactionHistoryFilters({ defaultFilters, onApply }: TransactionHistoryFiltersProps) {
  const [filters, setFilters] = useState<TransactionHistoryFiltersType>(defaultFilters ?? {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  async function handleApplyClick(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    await onApply(filters);
    setIsSubmitting(false);
  }

  return (
    <form className="flex flex-col flex-wrap items-center gap-4 sm:flex-row lg:items-end" onSubmit={handleApplyClick}>
      <RntInput
        isTransparentStyle={true}
        className="sm:max-w-[10.5rem]"
        id="dateFrom"
        label={t("common.from")}
        labelClassName="pl-4"
        inputClassName="pr-4"
        type="date"
        value={dateToHtmlDateFormat(filters.dateFrom)}
        onChange={(e) => {
          setFilters((prev) => ({
            ...prev,
            dateFrom: e.target.value ? moment(e.target.value).toDate() : undefined,
          }));
        }}
      />
      <RntInput
        isTransparentStyle={true}
        className="sm:max-w-[10.5rem]"
        id="dateTo"
        label={t("common.to")}
        labelClassName="pl-4"
        inputClassName="pr-4"
        type="date"
        value={dateToHtmlDateFormat(filters.dateTo)}
        onChange={(e) => {
          setFilters((prev) => ({
            ...prev,
            dateTo: e.target.value ? moment(e.target.value).toDate() : undefined,
          }));
        }}
      />
      <div className="flex items-center max-sm:w-full max-sm:justify-between">
        <RntFilterSelect
          isTransparentStyle={true}
          className="w-48"
          id="status"
          label={t("all_trips_table.tripStatus")}
          placeholder={t("transaction_history.all_statuses")}
          value={filters.status?.toString() || "none"}
          onChange={(e) => {
            setFilters((prev) => ({
              ...prev,
              status: e.target.value !== "none" ? BigInt(e.target.value) : undefined,
            }));
          }}
        >
          <RntFilterSelect.Option key={"key-none"} value={"none"}>
            {t("transaction_history.all_statuses")}
          </RntFilterSelect.Option>
          {allTripStatuses.map((i) => (
            <RntFilterSelect.Option key={i.id.toString()} value={i.id.toString()}>
              {i.text}
            </RntFilterSelect.Option>
          ))}
        </RntFilterSelect>
        <RntButton className="ml-4 mt-7 w-36 sm:w-40" type="submit" disabled={isSubmitting}>
          {t("common.apply")}
        </RntButton>
      </div>
    </form>
  );
}

export default TransactionHistoryFilters;
