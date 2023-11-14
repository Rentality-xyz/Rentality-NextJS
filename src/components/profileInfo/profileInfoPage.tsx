import RntButton from "@/components/common/rntButton";
import RntFileButton from "@/components/common/rntFileButton";
import RntInput from "@/components/common/rntInput";
import { ProfileSettings } from "@/hooks/useProfileSettings";
import { dateToHtmlDateFormat } from "@/utils/datetimeFormatters";
import { resizeImage } from "@/utils/image";
import { MESSAGES } from "@/utils/messages";
import { uploadFileToIPFS } from "@/utils/pinata";
import { isEmpty } from "@/utils/string";
import { ButtonMode, IdentityButton } from "@civic/ethereum-gateway-react";
import { Avatar } from "@mui/material";
import { useRouter } from "next/router";
import { FocusEvent, FormEvent, ReactNode, useState } from "react";

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
}: {
  savedProfileSettings: ProfileSettings;
  saveProfileSettings: (newProfileSettings: ProfileSettings) => Promise<boolean>;
  showInfo: (message: string, action?: ReactNode) => void;
  showError: (message: string, action?: ReactNode) => void;
  hideSnackbar: () => void;
}) {
  const router = useRouter();
  const [enteredFormData, setEnteredFormData] = useState<ProfileSettings>(savedProfileSettings);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const errors = getErrors(enteredFormData, profileImageFile);
  const isValid = Object.keys(errors).length === 0;

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.name;

    if (name === "profilePhotoUrl") {
      await handleFileUpload(e.target.files);
    } else if (name === "drivingLicenseExpire") {
      console.log("e.target.value", e.target.value);
      console.log("new Date(e.target.value)", new Date(e.target.value));

      setEnteredFormData({ ...enteredFormData, [name]: new Date(e.target.value) });
    } else {
      setEnteredFormData({ ...enteredFormData, [name]: e.target.value });
    }
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
      var profilePhotoUrl = "";

      if (profileImageFile !== null) {
        const response = await uploadFileToIPFS(profileImageFile);

        if (!response.success || !response.pinataURL) {
          throw new Error("Uploaded image to Pinata error");
        }
        profilePhotoUrl = response.pinataURL;
        console.log("Uploaded image to Pinata: ", profilePhotoUrl);
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
      router.push("/guest");
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
    if (isEmpty(formData.phoneNumber)) result.phoneNumber = "Please enter 'Phone number'";
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
          <RntInput
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
          <RntInput
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
          />
        </div>
      </fieldset>

      <IdentityButton mode={ButtonMode.LIGHT} className="mt-4" />

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
