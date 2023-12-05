import HostLayout from "@/components/host/layout/hostLayout";
import useAddCar from "@/hooks/host/useAddCar";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PageTitle from "@/components/pageTitle/pageTitle";
import RntButton from "@/components/common/rntButton";
import CarEditForm from "@/components/host/carEditForm/carEditForm";
import Link from "next/link";
import RntDialogs from "@/components/common/rntDialogs";
import useRntDialogs from "@/hooks/useRntDialogs";
import { resizeImage } from "@/utils/image";
import { isEmpty } from "@/utils/string";
import { Button } from "@mui/material";
import { useUserInfo } from "@/contexts/userInfoContext";
import { verifyCar } from "@/model/HostCarInfo";

export default function AddCar() {
  const [carInfoFormParams, setCarInfoFormParams, dataSaved, sentCarToServer] = useAddCar();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [carSaving, setCarSaving] = useState<boolean>(false);
  const [isButtonSaveDisabled, setIsButtonSaveDisabled] = useState<boolean>(false);
  const router = useRouter();
  const [dialogState, showInfo, showError, showMessager, hideSnackbar] = useRntDialogs();
  const userInfo = useUserInfo();

  const onChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) {
      return;
    }

    const file = e.target.files[0];
    const resizedImage = await resizeImage(file, 1000);
    setImageFile(resizedImage);

    var reader = new FileReader();

    reader.onload = function (event) {
      setCarInfoFormParams({
        ...carInfoFormParams,
        image: event.target?.result?.toString() ?? "",
      });
    };

    reader.readAsDataURL(resizedImage);
  };

  const saveCar = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (isEmpty(userInfo.drivingLicense)) {
      const action = (
        <>
          <Button
            color="secondary"
            size="small"
            onClick={() => {
              router.push("/host/profile");
            }}
          >
            My profile
          </Button>
        </>
      );
      showError("In order to save a car, please enter user information", action);
      return;
    }

    if (!imageFile) {
      showError("Image is not uploaded");
      return;
    }

    setCarSaving(true);

    try {
      setMessage("Please wait.. uploading (upto 5 mins)");
      const result = await sentCarToServer(imageFile);

      if (!result) {
        throw new Error("sentCarToServer error");
      }
      showInfo("Successfully listed your car!");

      setCarSaving(false);
      setMessage("");
      router.push("/host/vehicles");
    } catch (e) {
      showError("Save car request failed. Please try again");

      setCarSaving(false);
      setMessage("");
    }
  };

  useEffect(() => {
    setIsButtonSaveDisabled(imageFile == null || !verifyCar(carInfoFormParams) || carSaving);
  }, [imageFile, carInfoFormParams, carSaving]);

  useEffect(() => {
    if (isEmpty(userInfo.drivingLicense)) {
      const action = (
        <>
          <Button
            color="secondary"
            size="small"
            onClick={() => {
              router.push("/host/profile");
            }}
          >
            My profile
          </Button>
        </>
      );
      showError("In order to save a car, please enter user information", action);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HostLayout>
      <div className="flex flex-col">
        <PageTitle title="Add a car" />

        <CarEditForm
          carInfoFormParams={carInfoFormParams}
          setCarInfoFormParams={setCarInfoFormParams}
          onImageFileChange={onChangeFile}
          isNewCar={true}
        />

        <div className="flex flex-row gap-4 mb-8 mt-8 justify-between sm:justify-start">
          <RntButton className="w-40 h-16" disabled={isButtonSaveDisabled} onClick={saveCar}>
            Save
          </RntButton>
          <Link href={`/host/vehicles/listings`}>
            <RntButton className="w-40 h-16">Back</RntButton>
          </Link>
        </div>
        <label className="mb-4">{message}</label>
      </div>
      <RntDialogs state={dialogState} hide={hideSnackbar} />
    </HostLayout>
  );
}
