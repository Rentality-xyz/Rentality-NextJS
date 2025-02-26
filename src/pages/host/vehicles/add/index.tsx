import PageTitle from "@/components/pageTitle/pageTitle";
import CarEditForm from "@/components/host/carEditForm/carEditForm";
import { useTranslation } from "react-i18next";
import useSaveNewCar from "@/hooks/host/useSaveNewCar";

function AddCar() {
  const { mutateAsync: saveNewCar } = useSaveNewCar();
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("vehicles.title")} />
      <CarEditForm
        isNewCar={true}
        isInvestmentCar={false}
        saveCarInfo={async (hostCarInfo) => {
          return await saveNewCar(hostCarInfo);
        }}
        t={t}
      />
    </>
  );
}

export default AddCar;
