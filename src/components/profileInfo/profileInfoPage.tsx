import RntButton from "@/components/common/rntButton";
import RntFileButton from "@/components/common/rntFileButton";
import RntInput from "@/components/common/rntInput";
import { ProfileSettings } from "@/hooks/useProfileSettings";
import { resizeImage } from "@/utils/image";
import { MESSAGES } from "@/utils/messages";
import { uploadFileToIPFS } from "@/utils/pinata";
import { isEmpty } from "@/utils/string";
import { ButtonMode, IdentityButton } from "@civic/ethereum-gateway-react";
import { Avatar } from "@mui/material";
import { useRouter } from "next/router";
import { FocusEvent, FormEvent, ReactNode, useState } from "react";
import RntDatePicker from "../common/rntDatePicker";
import RntPhoneInput from "../common/rntPhoneInput";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import DriverLicenseVerified from "@/components/driver_license_verified/driver_license_verified";

const STATUS = {
  IDLE: "IDLE",
  SUBMITTED: "SUBMITTED",
  SUBMITTING: "SUBMITTING",
  COMPLETED: "COMPLETED",
};

export default function ProfileInfoPage({
  savedProfileSettings,
  saveProfileSettings,
  showInfo,
  showError,
  hideSnackbar,
  isHost,
}: {
  savedProfileSettings: ProfileSettings;
  saveProfileSettings: (newProfileSettings: ProfileSettings) => Promise<boolean>;
  showInfo: (message: string, action?: ReactNode) => void;
  showError: (message: string, action?: ReactNode) => void;
  hideSnackbar: () => void;
  isHost: boolean;
}) {
  const router = useRouter();
  const [enteredFormData, setEnteredFormData] = useState<ProfileSettings>(savedProfileSettings);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const ethereumInfo = useEthereum();

  const errors = getErrors(enteredFormData, profileImageFile);
  const isValid = Object.keys(errors).length === 0;

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

  async function handleBlur(e: FocusEvent<HTMLInputElement, Element>) {
    e.persist();
    setTouched((current) => {
      return { ...current, [e.target.id]: true };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(STATUS.SUBMITTING);

    if (!isValid) {
      setStatus(STATUS.SUBMITTED);
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

      hideSnackbar();
      if (!result) {
        throw new Error("Save profile info error");
      }
      showInfo(MESSAGES.SUCCESS);
      setStatus(STATUS.COMPLETED);
      router.reload();
      router.push(isHost ? "/host" : "/guest");
    } catch (e) {
      console.error("handleSubmit error:" + e);
      showError(MESSAGES.PROFILE_PAGE_SAVE_ERROR);
      setStatus(STATUS.SUBMITTED);
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
            validationError={touched.firstName || status === STATUS.SUBMITTED ? errors.firstName : ""}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <RntInput
            className="lg:w-60"
            id="lastName"
            label="Last name"
            value={enteredFormData.lastName}
            validationError={touched.lastName || status === STATUS.SUBMITTED ? errors.lastName : ""}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <RntPhoneInput
            className="lg:w-60"
            id="phoneNumber"
            label="Phone number"
            type="tel"
            value={enteredFormData.phoneNumber}
            validationError={touched.phoneNumber || status === STATUS.SUBMITTED ? errors.phoneNumber : ""}
            onChange={handleChange}
            onBlur={handleBlur}
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
            validationError={
              touched.drivingLicenseNumber || status === STATUS.SUBMITTED ? errors.drivingLicenseNumber : ""
            }
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {/* <RntInput
            className="lg:w-60"
            id="drivingLicenseExpire"
            label="Driving license validity period"
            type="date"
            value={dateToHtmlDateFormat(enteredFormData.drivingLicenseExpire)}
            validationError={
              touched.drivingLicenseExpire || status === STATUS.SUBMITTED ? errors.drivingLicenseExpire : ""
            }
            onChange={handleChange}
            onBlur={handleBlur}
          /> */}
          <RntDatePicker
            className="lg:w-60"
            id="drivingLicenseExpire"
            label="Driving license validity period"
            type="date"
            value={enteredFormData.drivingLicenseExpire}
            validationError={
              touched.drivingLicenseExpire || status === STATUS.SUBMITTED ? errors.drivingLicenseExpire : ""
            }
            onDateChange={handleDateChange}
            onBlur={handleBlur}
          />
        </div>
      </fieldset>

      <DriverLicenseVerified/>

      {!isValid && status === STATUS.SUBMITTED && (
        <div role="alert" className="text-red-400">
          <p>Please fix the following errors:</p>
          <ul>
            {Object.keys(errors).map((key) => {
              return <li key={key}>{errors[key]}</li>;
            })}
          </ul>
        </div>
      )}
      <RntButton type="submit" className="mt-4" disabled={!isValid}>
        Save
      </RntButton>
    </form>
  );
}
