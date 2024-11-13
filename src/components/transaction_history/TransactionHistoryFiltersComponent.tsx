import React, { useState } from "react";
import RntInput from "../common/rntInput";
import RntSelect from "../common/rntSelect";
import RntButton from "../common/rntButton";
import { dateToHtmlDateFormat } from "@/utils/datetimeFormatters";
import moment from "moment";
import { TripStatus } from "@/model/blockchain/schemas";
import { getTripStatusTextFromStatus } from "@/model/TripInfo";
import { useTranslation } from "react-i18next";
import { TransactionHistoryFilters } from "@/hooks/transaction_history/useTransactionHistory";

const allTripStatuses = Object.values(TripStatus).map((value) => {
  return { id: value, text: getTripStatusTextFromStatus(value) };
});

type TransactionHistoryFiltersComponentProps = {
  defaultFilters?: TransactionHistoryFilters;
  onApply: (filters: TransactionHistoryFilters) => Promise<void>;
};

function TransactionHistoryFiltersComponent({ defaultFilters, onApply }: TransactionHistoryFiltersComponentProps) {
  const [filters, setFilters] = useState<TransactionHistoryFilters>(defaultFilters ?? {});
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
        // onChange={(e) => {
        //   const newValue = moment(e.target.value);
        //   if (newValue.isValid()) {
        //     setFilters((prev) => {
        //       return { ...prev, dateTo: newValue.toDate() };
        //     });
        //   }
        // }}
      />
      <div className="sm:w-48">
        <RntSelect
          isTransparentStyle={true}
          className="mt-1 sm:max-w-[15rem]"
          selectClassName="cursor-pointer"
          id="status"
          label={t("all_trips_table.tripStatus")}
          labelClassName="pl-4"
          value={filters.status?.toString()}
          onChange={(e) => {
            setFilters((prev) => ({
              ...prev,
              status: e.target.value !== "none" ? BigInt(e.target.value) : undefined,
            }));
          }}
        >
          <option value={"none"}>{t("transaction_history.all_statuses")}</option>
          {allTripStatuses.map((i) => (
            <option key={i.id.toString()} value={i.id.toString()}>
              {i.text}
            </option>
          ))}
        </RntSelect>
      </div>

      <RntButton className="w-36 sm:w-40" type="submit" disabled={isSubmitting}>
        {t("common.apply")}
      </RntButton>
    </form>
  );
}

export default TransactionHistoryFiltersComponent;
