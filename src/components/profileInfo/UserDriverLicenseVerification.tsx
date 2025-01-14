import { ProfileSettings } from "@/hooks/useProfileSettings";
import { useTranslation } from "react-i18next";
import KycVerification from "./kyc_verification";
import { dateFormatShortMonthDateYear } from "@/utils/datetimeFormatters";
import { isEmpty } from "@/utils/string";

function UserDriverLicenseVerification({ savedProfileSettings }: { savedProfileSettings: ProfileSettings }) {
  const { t } = useTranslation();

  return (
    <fieldset className="mt-4">
      <strong className="mb-4 pl-[16px] text-lg">{t("profile.pass_verification")}</strong>
      <p className="pl-4 text-rentality-secondary">{t("profile.user_data_load_automatically")}</p>
      <KycVerification t={t} />

      <fieldset className="mt-4 flex flex-col pl-4">
        <strong className="mb-2">{t("profile.verified_user_data")}</strong>
        <VerifiedUserDataRow title={t("profile.name")} value={savedProfileSettings.fullname} />
        <VerifiedUserDataRow title={t("profile.document_type")} value={savedProfileSettings.documentType} />
        <VerifiedUserDataRow
          title={t("profile.driving_license_number")}
          value={savedProfileSettings.drivingLicenseNumber}
        />
        <VerifiedUserDataRow
          title={t("profile.driving_license_validity_period")}
          value={
            savedProfileSettings.drivingLicenseExpire
              ? dateFormatShortMonthDateYear(savedProfileSettings.drivingLicenseExpire)
              : !isEmpty(savedProfileSettings.drivingLicenseNumber)
                ? "Permanent"
                : ""
          }
        />
        <VerifiedUserDataRow title={t("profile.issue_country")} value={savedProfileSettings.issueCountry} />
        <VerifiedUserDataRow title={t("profile.email")} value={savedProfileSettings.email} />
      </fieldset>
    </fieldset>
  );
}

function VerifiedUserDataRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex flex-row gap-1">
      <span className="text-rentality-secondary">{title}:</span>
      <span>{value}</span>
    </div>
  );
}

export default UserDriverLicenseVerification;
