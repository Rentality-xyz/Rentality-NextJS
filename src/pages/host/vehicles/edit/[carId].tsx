import { useRouter } from "next/router";
import PageTitle from "@/components/pageTitle/pageTitle";
import CarEditForm from "@/components/host/carEditForm/carEditForm";
import useFetchCarInfo from "@/hooks/host/useFetchCarInfo";
import { useTranslation } from "react-i18next";
import useSaveCar from "@/hooks/host/useSaveCar";
import Loading from "@/components/common/Loading";

export default function EditCar() {
  const router = useRouter();
  const { carId } = router.query;
  const { t } = useTranslation();

  const carIdNumber = Number(carId) ?? -1;

  const { isLoading, hostCarInfo } = useFetchCarInfo(carIdNumber);
  const { updateCar } = useSaveCar();

  if (!carId) return null;

  return (
    <>
      <PageTitle title={t("vehicles.edit_car_title")} />
      {isLoading && <Loading />}
      {!isLoading && hostCarInfo.carId <= 0 && (
        <h1 className="text-rentality-alert-text py-8 text-2xl font-bold">{t("vehicles.can_not_edit")}</h1>
      )}
      {!isLoading && hostCarInfo.carId > 0 && (
        <>
          <CarEditForm
            initValue={hostCarInfo}
            isNewCar={false}
            saveCarInfo={async (hostCarInfo) => {
              return await updateCar(hostCarInfo);
            }}
            t={t}
          />
        </>
      )}
    </>
  );
}
