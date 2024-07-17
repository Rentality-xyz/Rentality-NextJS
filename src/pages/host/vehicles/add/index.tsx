import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import CarEditForm from "@/components/host/carEditForm/carEditForm";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { emptyHostCarInfo, HostCarInfo } from "@/model/HostCarInfo";
import useSaveCar from "@/hooks/host/useSaveCar";

export default function AddCar() {
  const [carInfoFormParams, setCarInfoFormParams] = useState<HostCarInfo>(emptyHostCarInfo);
  const { addNewCar } = useSaveCar();

  const { t } = useTranslation();

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("vehicles.title")} />

        <CarEditForm
          carInfoFormParams={carInfoFormParams}
          setCarInfoFormParams={setCarInfoFormParams}
          isNewCar={true}
          saveCarInfo={async (image) => {
            const success = await addNewCar(carInfoFormParams, image);
            if (success) {
              setCarInfoFormParams(emptyHostCarInfo);
            }
            return success;
          }}
          t={t}
        />
      </div>
    </Layout>
  );
}
