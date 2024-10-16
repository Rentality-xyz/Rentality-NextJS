import RntButton from "@/components/common/rntButton";
import RntInput from "@/components/common/rntInput";
import RntPlaceAutoComplete from "@/components/common/rntPlaceAutocomplete";
import RntSelect from "@/components/common/rntSelect";
import { AdminAllTripsFilters } from "@/hooks/admin/useAdminAllTrips";
import { getPaymentStatusText, getTripStatusTextFromAdminStatus } from "@/model/admin/AdminTripDetails";
import { AdminTripStatus, PaymentStatus } from "@/model/blockchain/schemas";
import { formatLocationInfoUpToCity } from "@/model/LocationInfo";
import { dateToHtmlDateFormat } from "@/utils/datetimeFormatters";
import { placeDetailsToLocationInfo } from "@/utils/location";
import { isEmpty } from "@/utils/string";
import moment from "moment";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { env } from "@/utils/env";
import {APIProvider} from '@vis.gl/react-google-maps';

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
    <APIProvider apiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <form className="flex flex-wrap items-end gap-4" onSubmit={handleApplyClick}>
        <RntSelect
          className="w-60"
          id="status"
          label={t("all_trips_table.tripStatus")}
          value={filters.status?.toString()}
          onChange={(e) => {
            setFilters((prev) => ({ ...prev, status: e.target.value !== "none" ? BigInt(e.target.value) : undefined }));
          }}
        >
          <option value={"none"}>{t("all_trips_table.allStatuses")}</option>
          {allTripStatuses.map((i) => (
            <option key={i.id.toString()} value={i.id.toString()}>
              {i.text}
            </option>
          ))}
        </RntSelect>
        <RntSelect
          className="w-60"
          id="paymentStatus"
          label={t("all_trips_table.paymentsStatus")}
          value={filters.paymentStatus?.toString()}
          onChange={(e) => {
            setFilters((prev) => ({
              ...prev,
              paymentStatus: e.target.value !== "none" ? BigInt(e.target.value) : undefined,
            }));
          }}
        >
          <option value={"none"}>{t("all_trips_table.allStatuses")}</option>
          {allPaymentStatuses.map((i) => (
            <option key={i.id.toString()} value={i.id.toString()}>
              {i.text}
            </option>
          ))}
        </RntSelect>
        <RntPlaceAutoComplete
          className="w-60"
          id="location"
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
          inputClassName="pr-4"
          id="dateFrom"
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
          inputClassName="pr-4"
          id="dateTo"
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
        <RntButton className="w-48" type="submit" disabled={isSubmitting}>
          {t("common.search")}
        </RntButton>
      </form>
    </APIProvider>
  );
}

export default AllTripsFilters;
