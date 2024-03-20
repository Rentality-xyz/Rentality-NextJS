import Layout from "@/components/layout/layout";
import useAddCar from "@/hooks/host/useAddCar";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PageTitle from "@/components/pageTitle/pageTitle";
import RntButton from "@/components/common/rntButton";
import CarEditForm from "@/components/host/carEditForm/carEditForm";
import { resizeImage } from "@/utils/image";
import { isEmpty } from "@/utils/string";
import { Button } from "@mui/material";
import { useUserInfo } from "@/contexts/userInfoContext";
import { verifyCar } from "@/model/HostCarInfo";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { DialogActions } from "@/utils/dialogActions";

export default function AddCar() {
  const [carInfoFormParams, setCarInfoFormParams, dataSaved, sentCarToServer] = useAddCar();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [carSaving, setCarSaving] = useState<boolean>(false);
  const router = useRouter();
  const { showInfo, showError, showDialog, hideDialogs } = useRntDialogs();

  const loadCarInfoFromJson = async (file: File) => {
    try {
      const fileText = await file.text();
      const data = JSON.parse(fileText);
      const carKeys = Object.keys(carInfoFormParams);

      Object.keys(data).forEach((key) => {
        if (carKeys.includes(key)) {
          setCarInfoFormParams((prev) => {
            return { ...prev, [key]: data[key] };
          });
        }
      });
    } catch (error) {}
  };

  const onChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) {
      return;
    }

    const file = e.target.files[0];

    if (file.type === "application/json") {
      loadCarInfoFromJson(file);
      return;
    }
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

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const isValidForm = verifyCar(carInfoFormParams);
    const isImageUploaded = imageFile !== null;

    if (!isValidForm && !isImageUploaded) {
      showDialog("Please fill in all fields and vehicle photo");
      return;
    }
    if (!isValidForm) {
      showDialog("Please fill in all fields");
      return;
    }
    if (!isImageUploaded) {
      showDialog("Please upload vehicle photo");
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

  const handleBack = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const action = (
      <>
        {DialogActions.OK(() => {
          hideDialogs();
          router.push("/host/vehicles/listings");
        })}
        {DialogActions.Cancel(hideDialogs)}
      </>
    );
    showDialog("Unsaved data will be lost", action);
  };

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title="Add a car" />

        <CarEditForm
          carInfoFormParams={carInfoFormParams}
          setCarInfoFormParams={setCarInfoFormParams}
          onImageFileChange={onChangeFile}
          isNewCar={true}
        />

        <div className="flex flex-row gap-4 mb-8 mt-8 justify-between sm:justify-start">
          <RntButton className="w-40 h-16" disabled={carSaving} onClick={handleSave}>
            Save
          </RntButton>
          <RntButton className="w-40 h-16" onClick={handleBack}>
            Back
          </RntButton>
        </div>
        <label className="mb-4">{message}</label>
      </div>
    </Layout>
  );
}
