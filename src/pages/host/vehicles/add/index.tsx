import Layout from "@/components/layout/layout";
import useAddCar from "@/hooks/host/useAddCar";
import {  useState } from "react";
import { useRouter } from "next/router";
import PageTitle from "@/components/pageTitle/pageTitle";
import RntButton from "@/components/common/rntButton";
import CarEditForm from "@/components/host/carEditForm/carEditForm";
import { resizeImage } from "@/utils/image";
import { verifyCar } from "@/model/HostCarInfo";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { DialogActions } from "@/utils/dialogActions";
import { useTranslation } from "react-i18next";

export default function AddCar() {
  const [carInfoFormParams, setCarInfoFormParams, dataSaved, sentCarToServer] = useAddCar();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [carSaving, setCarSaving] = useState<boolean>(false);
  const router = useRouter();
  const { showInfo, showError, showDialog, hideDialogs } = useRntDialogs();
  const { t } = useTranslation();

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
      showDialog(t("vehicles.fill_fields_photo"));
      return;
    }
    if (!isValidForm) {
      showDialog(t("vehicles.fill_fields"));
      return;
    }
    if (!isImageUploaded) {
      showDialog(t("vehicles.upload_photo"));
      return;
    }

    if (!imageFile) {
      showError(t("vehicles.image_not_upload"));
      return;
    }

    setCarSaving(true);

    try {
      setMessage(t("vehicles.wait_loading"));
      const result = await sentCarToServer(imageFile);

      if (!result) {
        throw new Error("sentCarToServer error");
      }
      showInfo(t("car_listed"));

      setCarSaving(false);
      setMessage("");
      router.push("/host/vehicles");
    } catch (e) {
      showError("vehicles.saving_failed");

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
    showDialog(t("vehicles.lost_unsaved"), action);
  };

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("vehicles.title")} />

        <CarEditForm
          carInfoFormParams={carInfoFormParams}
          setCarInfoFormParams={setCarInfoFormParams}
          onImageFileChange={onChangeFile}
          isNewCar={true}
          t={t}
        />

        <div className="flex flex-row gap-4 mb-8 mt-8 justify-between sm:justify-start">
          <RntButton className="w-40 h-16" disabled={carSaving} onClick={handleSave}>
            {t("common.save")}
          </RntButton>
          <RntButton className="w-40 h-16" onClick={handleBack}>
            {t("common.back")}
          </RntButton>
        </div>
        <label className="mb-4">{message}</label>
      </div>
    </Layout>
  );
}
