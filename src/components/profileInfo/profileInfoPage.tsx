import RntButton from "@/components/common/rntButton";
import RntFileButton from "@/components/common/rntFileButton";
import RntInput from "@/components/common/rntInput";
import { ProfileSettings } from "@/hooks/useProfileSettings";
import { resizeImage } from "@/utils/image";
import { MESSAGES } from "@/utils/messages";
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
import { useChat } from "@/contexts/chatContext";

function ProfileInfoPage({
  savedProfileSettings,
  saveProfileSettings,
  isHost,
}: {
  savedProfileSettings: ProfileSettings;
  saveProfileSettings: (newProfileSettings: ProfileSettings) => Promise<boolean>;
  isHost: boolean;
}) {
  const router = useRouter();
  const [enteredFormData, setEnteredFormData] = useState<ProfileSettings>(savedProfileSettings);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const ethereumInfo = useEthereum();
  const { showInfo, showError, showDialog, hideDialogs } = useRntDialogs();
  const { isMyChatKeysSaved, saveMyChatKeys } = useChat();

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
      showDialog("Please fill in all fields");
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

      showInfo(MESSAGES.CONFIRM_TRANSACTION_AND_WAIT);
      const result = await saveProfileSettings(dataToSave);

      hideDialogs();
      if (!result) {
        throw new Error("Save profile info error");
      }
      showInfo(MESSAGES.SUCCESS);
      router.reload();
      router.push(isHost ? "/host" : "/guest");
    } catch (e) {
      console.error("handleSubmit error:" + e);
      showError(MESSAGES.PROFILE_PAGE_SAVE_ERROR);
      return;
    }
  }

  function getErrors(formData: ProfileSettings, profileImageFile: File | null) {
    const result: { [key: string]: string } = {};

    if (isEmpty(formData.firstName)) result.firstName = "Please enter 'Name'";
    if (isEmpty(formData.lastName)) result.lastName = "Please enter 'Last name'";
    if (isEmpty(formData.phoneNumber) || formData.phoneNumber === "+")
      result.phoneNumber = "Please enter 'Phone number'";
    if (isEmpty(formData.drivingLicenseNumber)) result.drivingLicenseNumber = "Please enter 'Driving license number'";
    if (!formData.drivingLicenseExpire || Number.isNaN(formData.drivingLicenseExpire.getTime()))
      result.drivingLicenseExpire = "Please enter 'Driving license validity period'";
    if (!formData.isConfirmedTerms) result.isConfirmedTerms = "Please confirm terms and other documents";

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
        Upload
      </RntFileButton>

      <fieldset className="mt-4">
        <div className="text-lg mb-4">
          <strong>Basic information</strong>
        </div>
        <div className="flex flex-wrap gap-4">
          <RntInput
            className="lg:w-60"
            id="firstName"
            label="Name"
            value={enteredFormData.firstName}
            onChange={handleChange}
          />
          <RntInput
            className="lg:w-60"
            id="lastName"
            label="Last name"
            value={enteredFormData.lastName}
            onChange={handleChange}
          />

          <RntPhoneInput
            className="lg:w-60"
            id="phoneNumber"
            label="Phone number"
            type="tel"
            value={enteredFormData.phoneNumber}
            onChange={handleChange}
          />
        </div>
      </fieldset>

      <fieldset className="mt-4">
        <div className="text-lg mb-4">
          <strong>Driving license information</strong>
        </div>
        <div className="flex flex-wrap gap-4">
          <RntInput
            className="lg:w-60"
            id="drivingLicenseNumber"
            label="Driving license number"
            value={enteredFormData.drivingLicenseNumber}
            onChange={handleChange}
          />
          <RntDatePicker
            className="lg:w-60"
            id="drivingLicenseExpire"
            label="Driving license validity period"
            type="date"
            value={enteredFormData.drivingLicenseExpire}
            onDateChange={handleDateChange}
          />
        </div>
      </fieldset>

      <DriverLicenseVerified
        isConfirmed={enteredFormData.isConfirmedTerms}
        onConfirm={(isConfirmed) => {
          setEnteredFormData({ ...enteredFormData, isConfirmedTerms: isConfirmed });
        }}
      />

      <p className="mt-4">To use chat functionality you have to generate and save encryption keys</p>
      <div className="flex items-center">
        <RntButton type="button" onClick={saveMyChatKeys} disabled={isMyChatKeysSaved}>
          Save chat keys
        </RntButton>
        <div className="ml-2 md:ml-6">{isMyChatKeysSaved ? <GetChatKeySaved /> : <GetChatKeyNotSaved />}</div>
      </div>

      <RntButton type="submit" className="mt-4">
        Save
      </RntButton>
    </form>
  );
}

export default memo(ProfileInfoPage);

function GetChatKeyNotSaved() {
  return (
    <div className="flex items-center">
      <span className="w-4 h-4 bg-[#DB001A] rounded-full inline-block pr-4"></span>
      <span className="ml-2">Keys are not saved</span>
    </div>
  );
}

function GetChatKeySaved() {
  return (
    <div className="flex items-center">
      <span className="w-4 h-4 bg-[#2EB100] rounded-full inline-block pr-4"></span>
      <span className="ml-2">Keys are saved</span>
    </div>
  );
}
