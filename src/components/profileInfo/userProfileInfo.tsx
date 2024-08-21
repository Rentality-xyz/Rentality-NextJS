import RntButton from "@/components/common/rntButton";
import RntFileButton from "@/components/common/rntFileButton";
import RntInput from "@/components/common/rntInput";
import { ProfileSettings } from "@/hooks/useProfileSettings";
import { resizeImage } from "@/utils/image";
import { uploadFileToIPFS } from "@/utils/pinata";
import { isEmpty } from "@/utils/string";
import { Avatar } from "@mui/material";
import { useRouter } from "next/router";
import { ChangeEvent, memo } from "react";
import RntDatePicker from "../common/rntDatePicker";
import RntPhoneInput from "../common/rntPhoneInput";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { TFunction } from "@/utils/i18n";
import DotStatus from "./dotStatus";
import AgreementInfo from "./agreement_info";
import KycVerification from "./kyc_verification";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileInfoFormValues, profileInfoFormSchema } from "./profileInfoFormSchema";
import moment from "moment";
import { useChatKeys } from "@/contexts/chat/firebase/chatContext";

function UserProfileInfo({
  savedProfileSettings,
  saveProfileSettings,
  isHost,
  t,
}: {
  savedProfileSettings: ProfileSettings;
  saveProfileSettings: (newProfileSettings: ProfileSettings) => Promise<boolean>;
  isHost: boolean;
  t: TFunction;
}) {
  const router = useRouter();
  const ethereumInfo = useEthereum();
  const { showInfo, showError, showDialog, hideDialogs } = useRntDialogs();

  const { register, handleSubmit, formState, control } = useForm<ProfileInfoFormValues>({
    defaultValues: {
      profilePhotoUrl: savedProfileSettings.profilePhotoUrl,
      firstName: savedProfileSettings.firstName,
      lastName: savedProfileSettings.lastName,
      phoneNumber: savedProfileSettings.phoneNumber,
      drivingLicenseNumber: savedProfileSettings.drivingLicenseNumber,
      drivingLicenseExpire: savedProfileSettings.drivingLicenseExpire,
      tcSignature: savedProfileSettings.tcSignature,
    },
    resolver: zodResolver(profileInfoFormSchema),
  });
  const { errors, isSubmitting } = formState;
  const userInitials =
    !isEmpty(savedProfileSettings.firstName) || !isEmpty(savedProfileSettings.lastName)
      ? `${savedProfileSettings.firstName?.slice(0, 1).toUpperCase()}${savedProfileSettings.lastName?.slice(0, 1).toUpperCase()}`
      : null;

  const t_profile: TFunction = (name, options) => {
    return t("profile." + name, options);
  };

  function fileChangeCallback(field: ControllerRenderProps<ProfileInfoFormValues, "profilePhotoUrl">) {
    return async (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.length) {
        return;
      }

      const file = e.target.files[0];
      const resizedImage = await resizeImage(file, 300);
      if (!isEmpty(field.value) && field.value.startsWith("blob")) {
        console.log("Revoking ObjectURL");
        URL.revokeObjectURL(field.value);
      }
      const urlImage = URL.createObjectURL(resizedImage);
      field.onChange(urlImage);
    };
  }

  async function onFormSubmit(formData: ProfileInfoFormValues) {
    try {
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

      const dataToSave = {
        ...formData,
        profilePhotoUrl: profilePhotoUrl,
        drivingLicenseExpire: formData.drivingLicenseExpire,
      };

      showInfo(t("common.info.sign"));
      const result = await saveProfileSettings(dataToSave);

      hideDialogs();
      if (!result) {
        throw new Error("Save profile info error");
      }
      showInfo(t("common.info.success"));
      router.push(isHost ? "/host" : "/guest");
    } catch (e) {
      console.error("handleSubmit error:" + e);
      showError(t_profile("save_err"));
      return;
    }
  }

  return (
    <form
      className="my-1 flex flex-col gap-4 lg:my-8"
      onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}
    >
      <Controller
        name="profilePhotoUrl"
        control={control}
        render={({ field }) => (
          <>
            <div className="flex flex-row items-center gap-4">
              <Avatar
                alt={`${savedProfileSettings.firstName} ${savedProfileSettings.lastName}`}
                src={field.value}
                sx={{ width: "7rem", height: "7rem" }}
              >
                {userInitials}
              </Avatar>
              <div className="text-xl">
                {savedProfileSettings.firstName} {savedProfileSettings.lastName}
              </div>
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
        <div className="mb-4 text-lg">
          <strong>{t_profile("basic_info")}</strong>
        </div>
        <div className="flex flex-wrap gap-4">
          <RntInput
            className="lg:w-60"
            id="firstName"
            label={t_profile("name")}
            {...register("firstName")}
            validationError={errors.firstName?.message}
          />
          <RntInput
            className="lg:w-60"
            id="lastName"
            label={t_profile("last_name")}
            {...register("lastName")}
            validationError={errors.lastName?.message}
          />

          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <RntPhoneInput
                className="lg:w-60"
                id="phoneNumber"
                label={t_profile("phone")}
                type="tel"
                value={field.value}
                onChange={field.onChange}
                validationError={errors.phoneNumber?.message}
              />
            )}
          />
        </div>
      </fieldset>

      <fieldset className="mt-4">
        <div className="mb-4 text-lg">
          <strong>{t_profile("driver_license_info")}</strong>
        </div>
        <div className="flex flex-wrap gap-4">
          <RntInput
            className="lg:w-60"
            id="drivingLicenseNumber"
            label={t_profile("driving_license_number")}
            {...register("drivingLicenseNumber")}
            validationError={errors.drivingLicenseNumber?.message}
          />
          <Controller
            name="drivingLicenseExpire"
            control={control}
            render={({ field }) => (
              <RntDatePicker
                className="lg:w-60"
                id="drivingLicenseExpire"
                label={t_profile("driving_license_validity_period")}
                type="date"
                value={field.value}
                onDateChange={(date) => {
                  field.onChange(date ?? undefined);
                }}
                validationError={errors.drivingLicenseExpire?.message}
                maxDate={moment().add(15, "years").toDate()}
              />
            )}
          />
        </div>
      </fieldset>

      <KycVerification t={t_profile} />

      <Controller
        name="tcSignature"
        control={control}
        render={({ field }) => (
          <AgreementInfo
            signature={field.value}
            onSign={(signature) => {
              field.onChange(signature);
            }}
            t={t_profile}
          />
        )}
      />

      <RntButton type="submit" className="mt-4" disabled={isSubmitting}>
        {t("common.save")}
      </RntButton>
    </form>
  );
}

export default memo(UserProfileInfo);
