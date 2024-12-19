import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ProfileSettings } from "@/hooks/useProfileSettings";
import useSaveMyKycUserData from "@/hooks/useSaveMyKycUserData";
import { kycUserDataFormSchema, KycUserDataFormValues } from "./KycUserDataFormSchema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import KycVerification from "./kyc_verification";
import RntInput from "../common/rntInput";
import RntButton from "../common/rntButton";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { dateToHtmlDateFormat } from "@/utils/datetimeFormatters";
import moment from "moment";

function UserDriverLicenseVerification({ savedProfileSettings }: { savedProfileSettings: ProfileSettings }) {
  const ethereumInfo = useEthereum();
  const { saveMyKycUserData } = useSaveMyKycUserData();
  const { showInfo, showError, hideSnackbars } = useRntSnackbars();
  const { register, handleSubmit, formState, control } = useForm<KycUserDataFormValues>({
    defaultValues: {
      name: savedProfileSettings.fullname,
      documentType: savedProfileSettings.documentType,
      drivingLicenceNumber: savedProfileSettings.drivingLicenseNumber,
      drivingLicenceValidityPeriod: savedProfileSettings.drivingLicenseExpire,
      issueCountry: savedProfileSettings.issueCountry,
      email: savedProfileSettings.email,
    },
    resolver: zodResolver(kycUserDataFormSchema),
  });
  const { t } = useTranslation();
  const { errors, isSubmitting } = formState;

  async function onFormSubmit(formData: KycUserDataFormValues) {
    if (!ethereumInfo) return;

    if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
      showInfo(t("common.add_fund_to_wallet"));
      return;
    }

    try {
      showInfo(t("common.info.sign"));
      const result = await saveMyKycUserData(
        formData.name,
        formData.drivingLicenceNumber,
        formData.drivingLicenceValidityPeriod ?? new Date(0),
        formData.issueCountry,
        formData.email
      );

      hideSnackbars();
      if (!result) {
        throw new Error("Save profile info error");
      }
      showInfo(t("common.info.success"));
    } catch (e) {
      console.error("handleSubmit error:" + e);
      showError(t("profile.save_err"));
      return;
    }
  }

  return (
    <fieldset className="mt-4">
      <strong className="mb-4 pl-[16px] text-lg">{t("profile.pass_verification")}</strong>
      <p className="pl-4 text-rentality-secondary">{t("profile.user_data_load_automatically")}</p>
      <KycVerification t={t} />

      <form className="flex flex-col gap-4 lg:my-8" onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}>
        <fieldset className="mt-4">
          <div className="flex flex-wrap gap-4">
            <RntInput
              className="lg:w-60"
              labelClassName="pl-[16px]"
              id="name"
              label={t("profile.name")}
              {...register("name")}
              validationError={errors.name?.message}
            />
            <RntInput
              className="lg:w-60"
              labelClassName="pl-[16px]"
              id="documentType"
              label={t("profile.document_type")}
              {...register("documentType")}
              validationError={errors.documentType?.message}
            />
            <RntInput
              className="lg:w-60"
              labelClassName="pl-[16px]"
              id="drivingLicenceNumber"
              label={t("profile.driving_license_number")}
              {...register("drivingLicenceNumber")}
              validationError={errors.drivingLicenceNumber?.message}
            />

            <Controller
              name="drivingLicenceValidityPeriod"
              control={control}
              render={({ field }) => (
                <RntInput
                  className="lg:w-60"
                  inputClassName="pr-4"
                  id="dateFrom"
                  label={t("all_trips_table.start_date")}
                  type="date"
                  value={dateToHtmlDateFormat(field.value)}
                  onChange={(e) => {
                    field.onChange(e.target.value ? moment(e.target.value).toDate() : undefined);
                  }}
                />
              )}
            />
            <RntInput
              className="lg:w-60"
              labelClassName="pl-[16px]"
              id="issueCountry"
              label={t("profile.issue_country")}
              {...register("issueCountry")}
              validationError={errors.issueCountry?.message}
            />
            <RntInput
              className="lg:w-60"
              labelClassName="pl-[16px]"
              id="email"
              label={t("profile.email")}
              {...register("email")}
              validationError={errors.email?.message}
            />
          </div>
        </fieldset>

        <div className="flex items-center gap-2 md:gap-6">
          <RntButton type="submit" disabled={isSubmitting}>
            {t("common.save")}
          </RntButton>
        </div>
      </form>
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
