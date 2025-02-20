import { useTranslation } from "react-i18next";
import KycVerification from "./kyc_verification";
import { dateFormatShortMonthDateYear } from "@/utils/datetimeFormatters";
import { isEmpty } from "@/utils/string";
import useFetchUserProfile from "@/features/profile/hooks/useFetchUserProfile";
import RntSuspense from "../common/rntSuspense";

function UserDriverLicenseVerification() {
  const { isLoading, data: userProfile } = useFetchUserProfile();
  const { t } = useTranslation();

  return (
    <RntSuspense isLoading={isLoading}>
      <fieldset className="mt-4">
        <strong className="mb-4 pl-[16px] text-lg">{t("profile.pass_verification")}</strong>
        <p className="pl-4 text-rentality-secondary">{t("profile.user_data_load_automatically")}</p>
        <KycVerification t={t} />

        <fieldset className="mt-4 flex flex-col pl-4">
          <strong className="mb-2">{t("profile.verified_user_data")}</strong>
          <VerifiedUserDataRow title={t("profile.name")} value={userProfile.fullname} />
          <VerifiedUserDataRow title={t("profile.document_type")} value={userProfile.documentType} />
          <VerifiedUserDataRow title={t("profile.driving_license_number")} value={userProfile.drivingLicenseNumber} />
          <VerifiedUserDataRow
            title={t("profile.driving_license_validity_period")}
            value={
              userProfile.drivingLicenseExpire
                ? dateFormatShortMonthDateYear(userProfile.drivingLicenseExpire)
                : !isEmpty(userProfile.drivingLicenseNumber)
                  ? "Permanent"
                  : ""
            }
          />
          <VerifiedUserDataRow title={t("profile.issue_country")} value={userProfile.issueCountry} />
          <VerifiedUserDataRow title={t("profile.email")} value={userProfile.email} />
        </fieldset>
      </fieldset>
    </RntSuspense>
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
