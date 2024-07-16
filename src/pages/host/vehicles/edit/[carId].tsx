import Layout from "@/components/layout/layout";
import { useRouter } from "next/router";
import PageTitle from "@/components/pageTitle/pageTitle";
import CarEditForm from "@/components/host/carEditForm/carEditForm";
import useEditCarInfo from "@/hooks/host/useEditCarInfo";
import { useTranslation } from "react-i18next";

export default function EditCar() {
  const router = useRouter();
  const { carId } = router.query;
  const { t } = useTranslation();

  const carIdNumber = Number(carId) ?? -1;

  const [isLoading, carInfoFormParams, setCarInfoFormParams, _, saveCarInfo] = useEditCarInfo(carIdNumber);

  if (!carId) return null;

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("vehicles.edit_car_title")} />
        {isLoading ? (
          <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
            {t("common.info.loading")}
          </div>
        ) : carInfoFormParams.carId <= 0 ? (
          <h1 className="py-8 text-2xl font-bold text-red-800">{t("vehicles.can_not_edit")}</h1>
        ) : (
          <>
            <CarEditForm
              carInfoFormParams={carInfoFormParams}
              setCarInfoFormParams={setCarInfoFormParams}
              isNewCar={false}
              saveCarInfo={saveCarInfo}
              t={t}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
