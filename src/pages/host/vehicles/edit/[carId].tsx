import Layout from "@/components/layout/layout";
import { useState } from "react";
import { useRouter } from "next/router";
import PageTitle from "@/components/pageTitle/pageTitle";
import RntButton from "@/components/common/rntButton";
import CarEditForm from "@/components/host/carEditForm/carEditForm";
import useEditCarInfo from "@/hooks/host/useEditCarInfo";
import Link from "next/link";
import { verifyCar } from "@/model/HostCarInfo";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { DialogActions } from "@/utils/dialogActions";
import { useTranslation } from "react-i18next";

export default function EditCar() {
  const router = useRouter();
  const { carId } = router.query;
  const { t } = useTranslation();

  const carIdNumber = Number(carId) ?? -1;

  const [isLoading, carInfoFormParams, setCarInfoFormParams, _, saveCarInfo] = useEditCarInfo(carIdNumber);

  const [message, setMessage] = useState<string>("");
  const [carSaving, setCarSaving] = useState<boolean>(false);
  const { showInfo, showError, showDialog, hideDialogs } = useRntDialogs();

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const isValidForm = verifyCar(carInfoFormParams);

    if (!isValidForm) {
      showDialog(t("vehicles.fill_fields"));
      return;
    }

    setCarSaving(true);

    try {
      setMessage(t("vehicles.wait_loading"));
      const result = await saveCarInfo();

      if (!result) {
        throw new Error("saveCarInfo error");
      }
      showInfo(t("vehicles.edited"));

      setCarSaving(false);
      setMessage("");
      router.push("/host/vehicles");
    } catch (e) {
      showError(t("vehicles.editing_failed"));

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

  if (!carId) return null;

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("vehicles.edit_car_title")} />
        {isLoading ? (
          <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
            {t("common.info.loading")}
          </div>
        ) : carInfoFormParams.carId === -1 ? (
          <h1 className="py-8 text-2xl font-bold text-red-800">{t("vehicles.can_not_edit")}</h1>
        ) : (
          <>
            <CarEditForm
              carInfoFormParams={carInfoFormParams}
              setCarInfoFormParams={setCarInfoFormParams}
              onImageFileChange={async (e) => {}}
              isNewCar={false}
              t={t}
            />

            <div className="flex flex-row gap-4 mb-8 mt-8 items-center">
              <RntButton className="w-40 h-16" disabled={carSaving} onClick={handleSave}>
                Save
              </RntButton>
              <RntButton className="w-40 h-16" onClick={handleBack}>
                {t("common.back")}
              </RntButton>
              <Link href={`/host/vehicles/listings`}></Link>
            </div>
            <label className="mb-4">{message}</label>
          </>
        )}
      </div>
    </Layout>
  );
}
