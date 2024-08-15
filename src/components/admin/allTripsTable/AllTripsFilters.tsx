import RntButton from "@/components/common/rntButton";
import RntInput from "@/components/common/rntInput";
import RntPlaceAutoComplete from "@/components/common/rntPlaceAutocomplete";
import RntSelect from "@/components/common/rntSelect";
import { GoogleMapsProvider } from "@/contexts/googleMapsContext";
import { AdminAllTripsFilters, PaymentStatus, PaymentStatuses } from "@/hooks/admin/useAdminAllTrips";
import { TripStatus } from "@/model/blockchain/schemas";
import { formatLocationInfoUpToCity } from "@/model/LocationInfo";
import { getTripStatusTextFromAdminStatus } from "@/model/TripInfo";
import { dateToHtmlDateFormat } from "@/utils/datetimeFormatters";
import { isEmpty } from "@/utils/string";
import moment from "moment";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const allTripStatuses = Object.values(TripStatus).map((value) => {
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
    <GoogleMapsProvider libraries={["places"]} language="en">
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
              paymentStatus: e.target.value !== "none" ? (e.target.value as PaymentStatus) : undefined,
            }));
          }}
        >
          <option value={"none"}>{t("all_trips_table.allStatuses")}</option>
          {PaymentStatuses.map((i) => (
            <option key={i} value={i}>
              {i}
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
              location: !isEmpty(placeDetails.addressString)
                ? {
                    address: placeDetails.addressString,
                    country: placeDetails.country?.short_name ?? "",
                    state: placeDetails.state?.long_name ?? "",
                    city: placeDetails.city?.long_name ?? "",
                    latitude: placeDetails.location?.latitude ?? 0,
                    longitude: placeDetails.location?.longitude ?? 0,
                    timeZoneId: "",
                  }
                : undefined,
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
    </GoogleMapsProvider>
  );
}

export default AllTripsFilters;
