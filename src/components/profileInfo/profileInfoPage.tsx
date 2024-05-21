import RntButton from "@/components/common/rntButton";
import RntFileButton from "@/components/common/rntFileButton";
import RntInput from "@/components/common/rntInput";
import { ProfileSettings } from "@/hooks/useProfileSettings";
import { resizeImage } from "@/utils/image";
import { uploadFileToIPFS } from "@/utils/pinata";
import { isEmpty } from "@/utils/string";
import { Avatar } from "@mui/material";
import { useRouter } from "next/router";
import { FormEvent, memo, useState } from "react";
import RntDatePicker from "../common/rntDatePicker";
import RntPhoneInput from "../common/rntPhoneInput";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import DriverLicenseVerified from "@/components/driver_license_verified/driver_license_verified";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { useChatKeys } from "@/contexts/chatContext";
import { TFunction } from "@/utils/i18n";
import DotStatus from "./dotStatus";

function ProfileInfoPage({
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
  const [enteredFormData, setEnteredFormData] = useState<ProfileSettings>(savedProfileSettings);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const ethereumInfo = useEthereum();
  const { showInfo, showError, showDialog, hideDialogs } = useRntDialogs();
  const { isLoading: isChatKeysLoading, isChatKeysSaved, saveChatKeys } = useChatKeys();

  const t_profile: TFunction = (name, options) => {
    return t("profile." + name, options);
  };

  const errors = getErrors(enteredFormData, profileImageFile);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.name;

    if (name === "profilePhotoUrl") {
      await handleFileUpload(e.target.files);
    } else {
      setEnteredFormData({ ...enteredFormData, [name]: e.target.value });
    }
  }

  async function handleDateChange(date: Date | null) {
    setEnteredFormData({ ...enteredFormData, drivingLicenseExpire: date ?? undefined });
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const file = files[0];
    const resizedImage = await resizeImage(file, 300);
    setProfileImageFile(resizedImage);

    var reader = new FileReader();

    reader.onload = function (event) {
      setEnteredFormData({
        ...enteredFormData,
        profilePhotoUrl: event.target?.result?.toString() ?? "",
      });
    };

    reader.readAsDataURL(resizedImage);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const isValid = Object.keys(errors).length === 0;

    if (!isValid) {
      showDialog(t("common.info.fill_fields"));
      return;
    }

    try {
      var profilePhotoUrl = savedProfileSettings.profilePhotoUrl;

      if (profileImageFile !== null) {
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
        ...enteredFormData,
        profilePhotoUrl: profilePhotoUrl,
      };

      showInfo(t("common.info.sign"));
      const result = await saveProfileSettings(dataToSave);

      hideDialogs();
      if (!result) {
        throw new Error("Save profile info error");
      }
      showInfo(t("common.info.success"));
      router.reload();
      router.push(isHost ? "/host" : "/guest");
    } catch (e) {
      console.error("handleSubmit error:" + e);
      showError(t_profile("save_err"));
      return;
    }
  }

  function getErrors(formData: ProfileSettings, profileImageFile: File | null) {
    const result: { [key: string]: string } = {};

    if (isEmpty(formData.firstName)) result.firstName = t_profile("pls_name");
    if (isEmpty(formData.lastName)) result.lastName = t_profile("pls_last_name");
    if (isEmpty(formData.phoneNumber) || formData.phoneNumber === "+") result.phoneNumber = t_profile("pls_phone");
    if (isEmpty(formData.drivingLicenseNumber)) result.drivingLicenseNumber = t_profile("pls_license");
    if (!formData.drivingLicenseExpire || Number.isNaN(formData.drivingLicenseExpire.getTime()))
      result.drivingLicenseExpire = t_profile("pls_license_period");
    if (isEmpty(formData.tcSignature)) result.isConfirmedTerms = t_profile("pls_tc");

    return result;
  }

  return (
    <form className="my-8 flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-row gap-4 items-center">
        <Avatar
          alt={`${savedProfileSettings.firstName} ${savedProfileSettings.lastName}`}
          src={enteredFormData.profilePhotoUrl}
          sx={{ width: "7rem", height: "7rem" }}
        >
          {!isEmpty(savedProfileSettings.firstName) || !isEmpty(savedProfileSettings.lastName)
            ? savedProfileSettings.firstName?.slice(0, 1).toUpperCase() +
              savedProfileSettings.lastName?.slice(0, 1).toUpperCase()
            : null}
        </Avatar>
        <div className="text-xl">
          {savedProfileSettings.firstName} {savedProfileSettings.lastName}
        </div>
      </div>
      <RntFileButton className="w-40 h-16" id="profilePhotoUrl" onChange={handleChange}>
        {t("common.upload")}
      </RntFileButton>

      <fieldset className="mt-4">
        <div className="text-lg mb-4">
          <strong>{t_profile("basic_info")}</strong>
        </div>
        <div className="flex flex-wrap gap-4">
          <RntInput
            className="lg:w-60"
            id="firstName"
            label={t_profile("name")}
            value={enteredFormData.firstName}
            onChange={handleChange}
          />
          <RntInput
            className="lg:w-60"
            id="lastName"
            label={t_profile("last_name")}
            value={enteredFormData.lastName}
            onChange={handleChange}
          />

          <RntPhoneInput
            className="lg:w-60"
            id="phoneNumber"
            label={t_profile("phone")}
            type="tel"
            value={enteredFormData.phoneNumber}
            onChange={handleChange}
          />
        </div>
      </fieldset>

      <fieldset className="mt-4">
        <div className="text-lg mb-4">
          <strong>{t_profile("driver_license_info")}</strong>
        </div>
        <div className="flex flex-wrap gap-4">
          <RntInput
            className="lg:w-60"
            id="drivingLicenseNumber"
            label={t_profile("driving_license_number")}
            value={enteredFormData.drivingLicenseNumber}
            onChange={handleChange}
          />
          <RntDatePicker
            className="lg:w-60"
            id="drivingLicenseExpire"
            label={t_profile("driving_license_validity_period")}
            type="date"
            value={enteredFormData.drivingLicenseExpire}
            onDateChange={handleDateChange}
            validationError={
              isNaN(enteredFormData.drivingLicenseExpire?.getTime() ?? 0)
                ? "Please enter date in format mm/dd/year"
                : ""
            }
          />
        </div>
      </fieldset>

      <DriverLicenseVerified
        signature={enteredFormData.tcSignature}
        onSign={(signature) => {
          setEnteredFormData({ ...enteredFormData, tcSignature: signature });
        }}
        t={t_profile}
      />

      <p className="mt-4">{t_profile("generate_keys")}</p>
      <div className="flex items-center">
        <RntButton type="button" onClick={saveChatKeys} disabled={isChatKeysSaved || isChatKeysLoading}>
          {t_profile("save_chat_keys")}
        </RntButton>
        <div className="ml-2 md:ml-6">
          {isChatKeysLoading ? (
            <DotStatus color="#a59c38" text={t("common.info.loading")} />
          ) : isChatKeysSaved ? (
            <DotStatus color="success" text={t_profile("keys_saved")} />
          ) : (
            <DotStatus color="error" text={t_profile("keys_not_saved")} />
          )}
        </div>
      </div>

      <RntButton type="submit" className="mt-4">
        {t("common.save")}
      </RntButton>
    </form>
  );
}

export default memo(ProfileInfoPage);
