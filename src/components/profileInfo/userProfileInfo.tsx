import RntButton from "@/components/common/rntButton";
import RntFileButton from "@/components/common/rntFileButton";
import RntInput from "@/components/common/rntInput";
import { ProfileSettings } from "@/hooks/useProfileSettings";
import { resizeImage } from "@/utils/image";
import { uploadFileToIPFS } from "@/utils/pinata";
import { isEmpty } from "@/utils/string";
import { Avatar } from "@mui/material";
import { ChangeEvent, memo, useEffect } from "react";
import RntPhoneInput from "../common/rntPhoneInput";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { useRntDialogs, useRntSnackbars } from "@/contexts/rntDialogsContext";
import KycVerification from "./kyc_verification";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileInfoFormValues, profileInfoFormSchema } from "./profileInfoFormSchema";
import DotStatus from "./dotStatus";
import { dateFormatShortMonthDateYear } from "@/utils/datetimeFormatters";
import { useTranslation } from "react-i18next";
import { CheckboxLight } from "../common/rntCheckbox";
import { verifyMessage } from "ethers";
import { DEFAULT_AGREEMENT_MESSAGE } from "@/utils/constants";
import { signMessage } from "@/utils/ether";

function UserProfileInfo({
  savedProfileSettings,
  saveProfileSettings,
  isHost,
}: {
  savedProfileSettings: ProfileSettings;
  saveProfileSettings: (newProfileSettings: ProfileSettings) => Promise<boolean>;
  isHost: boolean;
}) {
  return (
    <div className="my-1 flex flex-col gap-4 lg:my-8">
      <UserCommonInformationForm
        savedProfileSettings={savedProfileSettings}
        saveProfileSettings={saveProfileSettings}
        isHost={isHost}
      />
      <hr />
      <UserDriverLicenseVerification savedProfileSettings={savedProfileSettings} />
    </div>
  );
}

function UserCommonInformationForm({
  savedProfileSettings,
  saveProfileSettings,
  isHost,
}: {
  savedProfileSettings: ProfileSettings;
  saveProfileSettings: (newProfileSettings: ProfileSettings) => Promise<boolean>;
  isHost: boolean;
}) {
  const ethereumInfo = useEthereum();
  const { showDialog, hideDialogs } = useRntDialogs();
  const { showInfo, showError, hideSnackbars } = useRntSnackbars();
  const { t } = useTranslation();

  const { register, handleSubmit, formState, control, setValue, watch } = useForm<ProfileInfoFormValues>({
    defaultValues: {
      profilePhotoUrl: savedProfileSettings.profilePhotoUrl,
      nickname: savedProfileSettings.nickname,
      phoneNumber: savedProfileSettings.phoneNumber,
      tcSignature: savedProfileSettings.tcSignature,
    },
    resolver: zodResolver(profileInfoFormSchema),
  });
  const { errors, isSubmitting } = formState;

  function fileChangeCallback(field: ControllerRenderProps<ProfileInfoFormValues, "profilePhotoUrl">) {
    return async (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.length) {
        return;
      }

      let file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        file = await resizeImage(file, 300);
      } else if (file.size > 5 * 1024 * 1024) {
        alert("File is too big");
        return;
      }

      if (!isEmpty(field.value) && field.value.startsWith("blob")) {
        console.log("Revoking ObjectURL");
        URL.revokeObjectURL(field.value);
      }
      const fileNameExt = file.name.slice(file.name.lastIndexOf(".") + 1);
      if (fileNameExt == "heic") {
        const convertHeicToPng = await import("@/utils/heic2any");
        const convertedFile = await convertHeicToPng.default(file);
        field.onChange(convertedFile.localUrl);
      } else {
        const urlImage = URL.createObjectURL(file);
        field.onChange(urlImage);
      }
    };
  }

  async function onFormSubmit(formData: ProfileInfoFormValues) {
    if (!ethereumInfo) return;
    if (!formData.isTerms) return;

    try {
      const signature = await signMessage(ethereumInfo.signer, DEFAULT_AGREEMENT_MESSAGE);
      console.debug(`tcSignature before: ${formData.tcSignature}`);
      setValue("tcSignature", signature);
      formData.tcSignature = signature;
      console.debug(`tcSignature after: ${formData.tcSignature}`);

      var profilePhotoUrl = savedProfileSettings.profilePhotoUrl;
      if (formData.profilePhotoUrl !== savedProfileSettings.profilePhotoUrl) {
        const blob = await (await fetch(formData.profilePhotoUrl)).blob();
        const profileImageFile = new File([blob], "profileImage", { type: "image/png" });

        const response = await uploadFileToIPFS(profileImageFile, "RentalityProfileImage", {
          createdAt: new Date().toISOString(),
          createdBy: ethereumInfo?.walletAddress ?? "",
          version: SMARTCONTRACT_VERSION,
          chainId: ethereumInfo?.chainId ?? 0,
        });

        if (!response.success || !response.pinataURL) {
          throw new Error("Uploaded image to Pinata error");
        }

        profilePhotoUrl = response.pinataURL;
      }

      const dataToSave: ProfileSettings = {
        ...formData,
        profilePhotoUrl: profilePhotoUrl,
        fullname: "",
        documentType: "",
        drivingLicenseNumber: "",
        drivingLicenseExpire: undefined,
        issueCountry: "",
        email: "",
      };

      showInfo(t("common.info.sign"));
      const result = await saveProfileSettings(dataToSave);

      hideDialogs();
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

  const isTerms = watch("isTerms");

  useEffect(() => {
    const checkSignature = async () => {
      if (!ethereumInfo) return;

      if (isEmpty(savedProfileSettings.tcSignature) || savedProfileSettings.tcSignature === "0x") {
        setValue("isTerms", false);
        return;
      }

      const userAddress = await ethereumInfo.signer.getAddress();
      const verifyAddress = verifyMessage(DEFAULT_AGREEMENT_MESSAGE, savedProfileSettings.tcSignature);
      const isSignatureCorrect = verifyAddress === userAddress;
      setValue("isTerms", isTerms || isSignatureCorrect);
    };

    checkSignature();
  }, [ethereumInfo, savedProfileSettings.tcSignature, setValue]);

  return (
    <form className="flex flex-col gap-4 lg:my-8" onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}>
      <Controller
        name="profilePhotoUrl"
        control={control}
        render={({ field }) => (
          <>
            <div className="flex flex-row items-center gap-4">
              <Avatar alt={`${savedProfileSettings.nickname}`} src={field.value} sx={{ width: "7rem", height: "7rem" }}>
                {savedProfileSettings.nickname}
              </Avatar>
              <div className="text-xl">{savedProfileSettings.nickname}</div>
            </div>
            <RntFileButton
              className="h-16 w-40"
              id="profilePhotoUrl"
              onChange={fileChangeCallback(field)}
              accept="image/png,image/jpeg"
            >
              {t("common.upload")}
            </RntFileButton>
          </>
        )}
      />

      <fieldset className="mt-4">
        <div className="mb-4 pl-[16px] text-lg">
          <strong>{t("profile.welcome_create_account")}</strong>
        </div>
        <div className="flex flex-wrap gap-4">
          <RntInput
            className="lg:w-60"
            labelClassName="pl-[16px]"
            id="nickname"
            label={t("profile.nickname")}
            {...register("nickname")}
            validationError={errors.nickname?.message}
          />

          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <RntPhoneInput
                className="lg:w-60"
                labelClassName="pl-[16px]"
                id="phoneNumber"
                label={t("profile.phone")}
                type="tel"
                value={field.value}
                onChange={field.onChange}
                validationError={errors.phoneNumber?.message}
              />
            )}
          />
        </div>
      </fieldset>

      <p className="w-full pl-4 md:w-3/4 xl:w-3/5 2xl:w-1/3">{t("profile.agreement_info")}</p>

      <Controller
        name="isTerms"
        control={control}
        render={({ field }) => (
          <CheckboxLight
            className="ml-4 underline"
            label={t("profile.tc_and_privacy_title")}
            checked={field.value}
            onChange={() => {
              window.open("https://rentality.xyz/legalmatters/terms", "_blank");
              field.onChange(true);
            }}
          />
        )}
      />
      <p className="pl-[16px] text-sm">{t("profile.read_agree")}</p>

      <div className="flex items-center gap-2 md:gap-6">
        <RntButton type="submit" disabled={isSubmitting || !isTerms}>
          {t("profile.confirm&save")}
        </RntButton>

        {!isEmpty(savedProfileSettings.tcSignature) && savedProfileSettings.tcSignature !== "0x" ? (
          <DotStatus color="success" text={t("profile.confirmed")} />
        ) : (
          <DotStatus color="error" text={t("profile.not_confirmed")} />
        )}
      </div>
    </form>
  );
}

function UserDriverLicenseVerification({ savedProfileSettings }: { savedProfileSettings: ProfileSettings }) {
  const { t } = useTranslation();

  return (
    <fieldset className="mt-4">
      <strong className="mb-4 pl-[16px] text-lg">{t("profile.pass_verification")}</strong>
      <p className="text-rentality-secondary">{t("profile.user_data_load_automatically")}</p>
      <KycVerification t={t} />

      <fieldset className="mt-4 flex flex-col">
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

export default memo(UserProfileInfo);
