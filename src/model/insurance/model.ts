import { TFunction } from "@/utils/i18n";
import { InsuranceType } from "../blockchain/schemas";

export type Insurance = {
  type: InsuranceType;
  photos: string[];
  companyName: string;
  policyNumber: string;
  comment: string;
  uploadedBy: string; // `Guest ${guestName} uploaded ${dateTime, DD.MM.YY hh:mm tt}` | `Guest ${guestName} deleted ${dateTime, DD.MM.YY hh:mm tt}`
};

export type TripInsurance = {
  tripId: number;
  insuranceType: InsuranceType;
  tripInfo: string; // "For all trips" | `#${tripId} ${carBrand} ${carModel} ${carYear} ${dateFrom, MMM DD} - ${dateTo, MMM DD YYYY}`
  startDateTime: Date;
  insurance: Insurance;
  hostPhoneNumber: string;
  guestPhoneNumber: string;
};

export function getInsuranceTypeText(type: InsuranceType, t?: TFunction) {
  switch (type) {
    case InsuranceType.General:
      return t ? t("insurance.insurance_type_general") : "General Insurance ID";
    case InsuranceType.OneTime:
      return t ? t("insurance.insurance_type_one_time") : "One-Time trip insurance";
    default:
      return t ? t("insurance.insurance_type_unknown") : "Unknown";
  }
}

export function getInsuranceStatusText(type: InsuranceType, t?: TFunction) {
  switch (type) {
    case InsuranceType.General:
    case InsuranceType.OneTime:
      return t ? t("insurance.insurance_data_status_actual") : "active";
    default:
      return t ? t("insurance.insurance_data_status_canceled") : "rejected";
  }
}
