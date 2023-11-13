import RntButton from "@/components/common/rntButton";
import RntDialogs from "@/components/common/rntDialogs";
import RntFileButton from "@/components/common/rntFileButton";
import RntInput from "@/components/common/rntInput";
import GuestLayout from "@/components/guest/layout/guestLayout";
import PageTitle from "@/components/pageTitle/pageTitle";
import useProfileSettings, {
  ProfileSettings,
} from "@/hooks/useProfileSettings";
import useRntDialogs from "@/hooks/useRntDialogs";
import {
  dateToHtmlDateFormat,
} from "@/utils/datetimeFormatters";
import { resizeImage } from "@/utils/image";
import { uploadFileToIPFS } from "@/utils/pinata";
import { isEmpty } from "@/utils/string";
import { Avatar } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {ButtonMode, IdentityButton} from "@civic/ethereum-gateway-react";

export default function Profile() {
  const router = useRouter();
  const [dataFetched, savedProfileSettings, saveProfileSettings] =
    useProfileSettings();
  const [userProfileInfo, setUserProfileInfo] =
    useState<ProfileSettings>(savedProfileSettings);
  const [dialogState, showInfo, showError, showMessager, hideSnackbar] =
    useRntDialogs();
  const [requestSending, setRequestSending] = useState<boolean>(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  useEffect(() => {
    setUserProfileInfo(savedProfileSettings);
  }, [savedProfileSettings]);

  const saveUserInfo = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      if (isEmpty(userProfileInfo.firstName)) {
        showError("Please enter 'Name'");
        return;
      }
      if (isEmpty(userProfileInfo.lastName)) {
        showError("Please enter 'Last name'");
        return;
      }
      if (isEmpty(userProfileInfo.phoneNumber)) {
        showError("Please enter 'Phone number'");
        return;
      }
      if (isEmpty(userProfileInfo.drivingLicenseNumber)) {
        showError("Please enter 'Driving license number'");
        return;
      }
      if (userProfileInfo.drivingLicenseExpire === undefined) {
        showError("Please enter 'Driving license validity period'");
        return;
      }
      setRequestSending(true);

      let dataToSave: ProfileSettings = userProfileInfo;

      if (profileImageFile !== null) {
        const response = await uploadFileToIPFS(profileImageFile);

        if (response.success !== true) {
          console.error("Uploaded image to Pinata error");

          setRequestSending(false);
          return false;
        }
        console.log("Uploaded image to Pinata: ", response.pinataURL);

        dataToSave = {
          ...dataToSave,
          profilePhotoUrl: response.pinataURL,
        };
      }

      showInfo(
        "Please confirm the transaction with your wallet and wait for the transaction to be processed"
      );
      const result = await saveProfileSettings(dataToSave);

      setRequestSending(false);
      hideSnackbar();
      if (!result) {
        showError("Save profile info request failed. Pleas try again");
        return;
      }
      showInfo("Success");
      router.reload();
      router.push("/guest");
    } catch (e) {
      showError("Save profile info request failed. Pleas try again");
      console.error("saveProfileSettings error:" + e);

      setRequestSending(false);
    }
  };

  const onChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) {
      return;
    }

    const file = e.target.files[0];
    const resizedImage = await resizeImage(file, 300);
    setProfileImageFile(resizedImage);

    var reader = new FileReader();

    reader.onload = function (event) {
      setUserProfileInfo({
        ...userProfileInfo,
        profilePhotoUrl: event.target?.result?.toString() ?? "",
      });
    };

    reader.readAsDataURL(resizedImage);
  };

  return (
    <GuestLayout>
      <div className="flex flex-col">
        <PageTitle title="Profile settings" />
        {!dataFetched ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            Loading...
          </div>
        ) : (
          <div className="my-8 flex flex-col gap-4">
            <div className="flex flex-row gap-4 items-center">
              <Avatar
                alt={`${savedProfileSettings.firstName} ${savedProfileSettings.lastName}`}
                src={userProfileInfo.profilePhotoUrl}
                sx={{ width: "7rem", height: "7rem" }}
              >
                {!isEmpty(savedProfileSettings.firstName) ||
                !isEmpty(savedProfileSettings.lastName)
                  ? savedProfileSettings.firstName?.slice(0, 1).toUpperCase() +
                    savedProfileSettings.lastName?.slice(0, 1).toUpperCase()
                  : null}
              </Avatar>
              <div className="text-xl">
                {savedProfileSettings.firstName} {savedProfileSettings.lastName}
              </div>
            </div>
            <RntFileButton className="w-40 h-16" onChange={onChangeFile}>
              Upload
            </RntFileButton>

            <div className="mt-4">
              <div className="text-lg mb-4">
                <strong>Basic information</strong>
              </div>
              <div className="flex flex-wrap gap-4">
                <RntInput
                  className="lg:w-60"
                  id="firstName"
                  label="Name"
                  value={userProfileInfo.firstName}
                  onChange={(e) =>
                    setUserProfileInfo({
                      ...userProfileInfo,
                      firstName: e.target.value,
                    })
                  }
                />
                <RntInput
                  className="lg:w-60"
                  id="lastName"
                  label="Last name"
                  value={userProfileInfo.lastName}
                  onChange={(e) =>
                    setUserProfileInfo({
                      ...userProfileInfo,
                      lastName: e.target.value,
                    })
                  }
                />
                <RntInput
                  className="lg:w-60"
                  id="phone"
                  label="Phone number"
                  type="tel"
                  value={userProfileInfo.phoneNumber}
                  onChange={(e) =>
                    setUserProfileInfo({
                      ...userProfileInfo,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-lg mb-4">
                <strong>Driving license information</strong>
              </div>
              <div className="flex flex-wrap gap-4">
                <RntInput
                  className="lg:w-60"
                  id="licenseNumber"
                  label="Driving license number"
                  value={userProfileInfo.drivingLicenseNumber}
                  onChange={(e) =>
                    setUserProfileInfo({
                      ...userProfileInfo,
                      drivingLicenseNumber: e.target.value,
                    })
                  }
                />
                <RntInput
                  className="lg:w-60"
                  id="licenseDate"
                  label="Driving license validity period"
                  type="date"
                  value={dateToHtmlDateFormat(
                    userProfileInfo.drivingLicenseExpire
                  )}
                  onChange={(e) =>
                    setUserProfileInfo({
                      ...userProfileInfo,
                      drivingLicenseExpire: new Date(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <IdentityButton mode={ButtonMode.LIGHT} className="mt-4"/>
            <RntButton className = "mt-4" disabled={requestSending} onClick={saveUserInfo}>
              Save
            </RntButton>
          </div>
        )}
      </div>
      <RntDialogs state={dialogState} hide={hideSnackbar} />
    </GuestLayout>
  );
}
