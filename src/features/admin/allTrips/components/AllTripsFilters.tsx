import React, { useState } from "react";
import RntButton from "@/components/common/rntButton";
import RntInput from "@/components/common/rntInput";
import RntPlaceAutoComplete from "@/components/common/rntPlaceAutocomplete";
import RntSelect from "@/components/common/rntSelect";
import { AdminAllTripsFilters } from "@/features/admin/allTrips/hooks/useAdminAllTrips";
import {
  getPaymentStatusText,
  getTripStatusTextFromAdminStatus,
} from "@/features/admin/allTrips/models/AdminTripDetails";
import { AdminTripStatus, PaymentStatus } from "@/model/blockchain/schemas";
import { formatLocationInfoUpToCity } from "@/model/LocationInfo";
import { dateToHtmlDateFormat } from "@/utils/datetimeFormatters";
import { placeDetailsToLocationInfo } from "@/utils/location";
import { isEmpty } from "@/utils/string";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { env } from "@/utils/env";
import { APIProvider } from "@vis.gl/react-google-maps";
import RntFilterSelect from "@/components/common/RntFilterSelect";
import ScrollingHorizontally from "@/components/common/ScrollingHorizontally";

const allPaymentStatuses = Object.values(PaymentStatus)
  .slice(1)
  .map((value) => {
    return { id: value, text: getPaymentStatusText(value) };
  });

const allTripStatuses = Object.values(AdminTripStatus)
  .slice(1)
  .map((value) => {
    return { id: value, text: getTripStatusTextFromAdminStatus(value) };
  });

interface AllTripsFiltersProps {
  defaultFilters?: AdminAllTripsFilters;
  onApply: (filters: AdminAllTripsFilters) => Promise<void>;
}

function AllTripsFilters({ defaultFilters, onApply }: AllTripsFiltersProps) {
  const [filters, setFilters] = useState<AdminAllTripsFilters>(defaultFilters ?? {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  async function handleApplyClick(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    await onApply(filters);
    setIsSubmitting(false);
  }

  return (
    <APIProvider apiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={["places"]} language="en">
      <ScrollingHorizontally topLeftButton="top-[60px]" topRightButton="top-[60px]">
        <form className="flex items-end justify-between gap-4 fullHD:w-full" onSubmit={handleApplyClick}>
          <RntPlaceAutoComplete
            className="w-60"
            inputClassName="mt-1 z-10 pb-1 focus:outline-none focus:ring-0"
            id="location"
            isTransparentStyle={true}
            isDarkPlacePredictions={true}
            label={t("all_trips_table.location")}
            initValue={filters.location ? formatLocationInfoUpToCity(filters.location) : ""}
            onAddressChange={async (placeDetails) => {
              setFilters((prev) => ({
                ...prev,
                location: !isEmpty(placeDetails.addressString) ? placeDetailsToLocationInfo(placeDetails) : undefined,
              }));
            }}
          />
          <RntInput
            className="w-60"
            inputClassName="pr-4 mt-1 pb-1 focus:outline-none focus:ring-0"
            labelClassName="pl-4"
            id="dateFrom"
            isTransparentStyle={true}
            label={t("all_trips_table.start_date")}
            type="date"
            value={dateToHtmlDateFormat(filters.startDateTimeUtc)}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                startDateTimeUtc: e.target.value ? moment(e.target.value).toDate() : undefined,
              }));
            }}
          />
          <RntInput
            className="w-60"
            inputClassName="pr-4 mt-1 pb-1 focus:outline-none focus:ring-0"
            labelClassName="pl-4"
            id="dateTo"
            isTransparentStyle={true}
            label={t("all_trips_table.end_date")}
            type="date"
            value={dateToHtmlDateFormat(filters.endDateTimeUtc)}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                endDateTimeUtc: e.target.value ? moment(e.target.value).toDate() : undefined,
              }));
            }}
          />
          <RntFilterSelect
            containerClassName="w-60"
            id="status"
            isTransparentStyle={true}
            label={t("all_trips_table.tripStatus")}
            placeholder={t("all_trips_table.allStatuses")}
            value={filters.status?.toString()}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                status: BigInt(e.target.value),
              }));
            }}
          >
            <RntFilterSelect.Option key={"key-allStatuses"} value={AdminTripStatus.Any.toString()}>
              {t("all_trips_table.allStatuses")}
            </RntFilterSelect.Option>
            {allTripStatuses.map((i) => (
              <RntFilterSelect.Option key={i.id.toString()} value={i.id.toString()}>
                {i.text}
              </RntFilterSelect.Option>
            ))}
          </RntFilterSelect>
          <RntFilterSelect
            containerClassName="w-60"
            id="paymentStatus"
            isTransparentStyle={true}
            label={t("all_trips_table.paymentsStatus")}
            placeholder={t("all_trips_table.paymentsStatus")}
            value={filters.paymentStatus?.toString()}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                paymentStatus: BigInt(e.target.value),
              }));
            }}
          >
            <RntFilterSelect.Option key={"key-allStatuses"} value={PaymentStatus.Any.toString()}>
              {t("all_trips_table.allStatuses")}
            </RntFilterSelect.Option>
            {allPaymentStatuses.map((i) => (
              <RntFilterSelect.Option key={i.id.toString()} value={i.id.toString()}>
                {i.text}
              </RntFilterSelect.Option>
            ))}
          </RntFilterSelect>
          <RntButton className="w-60" type="submit" disabled={isSubmitting}>
            {t("common.search")}
          </RntButton>
        </form>
      </ScrollingHorizontally>
    </APIProvider>
  );
}

export default AllTripsFilters;
