import HostLayout from "@/components/host/layout/hostLayout";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PageTitle from "@/components/pageTitle/pageTitle";
import RntButton from "@/components/common/rntButton";
import CarEditForm from "@/components/host/carEditForm/carEditForm";
import useEditCarInfo from "@/hooks/host/useEditCarInfo";
import Link from "next/link";
import useRntDialogs from "@/hooks/useRntDialogs";
import RntDialogs from "@/components/common/rntDialogs";

export default function EditCar() {
  const router = useRouter();
  const { carId } = router.query;

  const carIdNumber = Number(carId) ?? -1;

  const [
    dataFetched,
    carInfoFormParams,
    setCarInfoFormParams,
    verifyCar,
    dataSaved,
    saveCarInfo,
  ] = useEditCarInfo(carIdNumber);

  const [message, setMessage] = useState<string>("");
  const [carSaving, setCarSaving] = useState<boolean>(false);
  const [isButtonSaveDisabled, setIsButtonSaveDisabled] =
    useState<boolean>(false);
  const [dialogState, showInfo, showError, showMessager, hideSnackbar] =
    useRntDialogs();

  const saveChanges = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setCarSaving(true);

    try {
      setMessage("Please wait.. uploading (upto 5 mins)");
      const result = await saveCarInfo();

      if (!result) {
        throw new Error("saveCarInfo error");
      }
      showInfo("Successfully edited your car info!");

      setCarSaving(false);
      setMessage("");
      router.push("/host/vehicles");
    } catch (e) {
      showError("Edit car request failed. Please try again");

      setCarSaving(false);
      setMessage("");
    }
  };

  useEffect(() => {
    setIsButtonSaveDisabled(!verifyCar() || carSaving);
  }, [carInfoFormParams.pricePerDay, verifyCar, carSaving]);

  if (!carId) return null;

  return (
    <HostLayout>
      <div className="flex flex-col">
        <PageTitle title="Edit your car" />
        {!dataFetched ? (
          <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
            Loading...
          </div>
        ) : carInfoFormParams.carId === -1 ? (
          <h1 className="py-8 text-2xl font-bold text-red-800">
            Sorry, but you can not edit this car
          </h1>
        ) : (
          <>
            <CarEditForm
              carInfoFormParams={carInfoFormParams}
              setCarInfoFormParams={setCarInfoFormParams}
              onImageFileChange={async (e) => {}}
              isNewCar={false}
            />

            <div className="flex flex-row gap-4 mb-8 mt-8 items-center">
              <RntButton
                className="w-40 h-16"
                disabled={isButtonSaveDisabled}
                onClick={saveChanges}
              >
                Save
              </RntButton>
              <Link href={`/host/vehicles/listings`}>
                <RntButton className="w-40 h-16">Back</RntButton>
              </Link>
              <label>{message}</label>
            </div>
          </>
        )}
      </div>
      <RntDialogs state={dialogState} hide={hideSnackbar} />
    </HostLayout>
  );
}
