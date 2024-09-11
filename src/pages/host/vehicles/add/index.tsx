import PageTitle from "@/components/pageTitle/pageTitle";
import CarEditForm from "@/components/host/carEditForm/carEditForm";
import { useTranslation } from "react-i18next";
import useSaveCar from "@/hooks/host/useSaveCar";

export default function AddCar() {
  const { addNewCar } = useSaveCar();
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("vehicles.title")} />
      <CarEditForm
        isNewCar={true}
        saveCarInfo={async (hostCarInfo, image) => {
          return await addNewCar(hostCarInfo, image);
        }}
        t={t}
      />
    </>
  );
}
