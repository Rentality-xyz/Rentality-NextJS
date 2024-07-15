import Layout from "@/components/layout/layout";
import useAddCar from "@/hooks/host/useAddCar";
import PageTitle from "@/components/pageTitle/pageTitle";
import CarEditForm from "@/components/host/carEditForm/carEditForm";
import { useTranslation } from "react-i18next";

export default function AddCar() {
  const [carInfoFormParams, setCarInfoFormParams, dataSaved, sentCarToServer] = useAddCar();

  const { t } = useTranslation();

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("vehicles.title")} />

        <CarEditForm
          carInfoFormParams={carInfoFormParams}
          setCarInfoFormParams={setCarInfoFormParams}
          isNewCar={true}
          saveCarInfo={sentCarToServer}
          t={t}
        />
      </div>
    </Layout>
  );
}
