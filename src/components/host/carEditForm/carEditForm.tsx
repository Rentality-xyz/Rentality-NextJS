import RntInput from "@/components/common/rntInput";
import {
  emptyHostCarInfo,
  HostCarInfo,
  isUnlimitedMiles,
  UNLIMITED_MILES_VALUE_TEXT,
  verifyCar,
} from "@/model/HostCarInfo";
import { useEffect, useMemo, useState } from "react";
import RntPlaceAutocomplete from "@/components/common/rntPlaceAutocomplete";
import RntCheckbox, { CheckboxLight } from "@/components/common/rntCheckbox";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PETROL_STRING } from "@/model/EngineType";
import RntButton from "@/components/common/rntButton";
import { TFunction } from "@/utils/i18n";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { useRntDialogs, useRntSnackbars } from "@/contexts/rntDialogsContext";
import { DialogActions } from "@/utils/dialogActions";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { carEditFormSchema, CarEditFormValues } from "./carEditFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import RntInputMultiline from "@/components/common/rntInputMultiline";
import { TRANSMISSION_AUTOMATIC_STRING, TRANSMISSION_MANUAL_STRING } from "@/model/Transmission";
import RntValidationError from "@/components/common/RntValidationError";
import RntCarMakeSelect from "@/components/common/rntCarMakeSelect";
import RntCarModelSelect from "@/components/common/rntCarModelSelect";
import RntCarYearSelect from "@/components/common/rntCarYearSelect";
import RntVINCheckingInput from "@/components/common/rntVINCheckingInput";
import * as React from "react";
import { placeDetailsToLocationInfoWithTimeZone } from "@/utils/location";
import CarAddPhoto from "./CarAddPhoto";
import { env } from "@/utils/env";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Result } from "@/model/utils/result";
import useCarAPI from "@/hooks/useCarAPI";
import { VinInfo } from "@/pages/api/car-api/vinInfo";
import { DimoCarResponseWithTimestamp } from "@/features/dimo/hooks/useDimo";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import RntFilterSelect from "@/components/common/RntFilterSelect";

export default function CarEditForm({
  initValue,
  isNewCar,
  isInvestmentCar,
  saveCarInfo,
  t,
}: {
  initValue?: HostCarInfo;
  isNewCar: boolean;
  isInvestmentCar: boolean;
  saveCarInfo: (hostCarInfo: HostCarInfo) => Promise<Result<boolean, Error>>;
  t: TFunction;
}) {
  const router = useRouter();
  const { showDialog, hideDialogs } = useRntDialogs();
  const { showInfo, showError, showSuccess } = useRntSnackbars();

  const { register, control, handleSubmit, formState, setValue, watch } = useForm<CarEditFormValues>({
    defaultValues:
      !isNewCar && initValue !== undefined
        ? {
            carId: initValue.carId,
            vinNumber: initValue.vinNumber,
            brand: initValue.brand,
            model: initValue.model,
            releaseYear: initValue.releaseYear,

            images: initValue.images,

            name: initValue.name,
            licensePlate: initValue.licensePlate,
            licenseState: initValue.licenseState,
            engineTypeText: initValue.engineTypeText,

            seatsNumber: initValue.seatsNumber,
            doorsNumber: initValue.doorsNumber,
            tankVolumeInGal: initValue.tankVolumeInGal,
            transmission: initValue.transmission,
            color: initValue.color,

            description: initValue.description,

            isLocationEdited: initValue.isLocationEdited,
            locationInfo: initValue.locationInfo,

            milesIncludedPerDay: initValue.milesIncludedPerDay,

            pricePerDay: initValue.pricePerDay,
            securityDeposit: initValue.securityDeposit,
            fuelPricePerGal: initValue.fuelPricePerGal,
            fullBatteryChargePrice: initValue.fullBatteryChargePrice,
            isGuestInsuranceRequired: initValue.isGuestInsuranceRequired,
            insurancePerDayPriceInUsd: initValue.insurancePerDayPriceInUsd,

            timeBufferBetweenTripsInMin: initValue.timeBufferBetweenTripsInMin,
            currentlyListed: initValue.currentlyListed,
          }
        : {
            carId: 0,
            isLocationEdited: true,
            currentlyListed: true,
            images: [],
            isGuestInsuranceRequired: false,
            insurancePerDayPriceInUsd: 0,
          },
    resolver: zodResolver(carEditFormSchema),
  });

  let dimoData: DimoCarResponseWithTimestamp | undefined;
  if (isNewCar && typeof window !== "undefined") {
    const dimoItem = localStorage.getItem("dimo");
    if (dimoItem !== null) {
      const timestamp = new Date().getTime();
      const expirationTime = 5 * 60 * 1000;
      const parsedData = JSON.parse(dimoItem);
      if (parsedData.timestamp && parsedData.timestamp + expirationTime > timestamp) dimoData = parsedData;
      else {
        localStorage.removeItem("dimo");
      }
    }
  }

  const { errors, isSubmitting } = formState;

  const [message, setMessage] = useState<string>("");
  const [autocomplete, setAutocomplete] = useState(initValue?.locationInfo.address ?? "");

  const pricePerDay = watch("pricePerDay");
  const milesIncludedPerDay = watch("milesIncludedPerDay");

  const fuelPricePerMile = Math.ceil((Number(pricePerDay) * 100) / Number(milesIncludedPerDay)) / 100;
  const fuelPricePerMileText = Number.isFinite(fuelPricePerMile) ? displayMoneyWith2Digits(fuelPricePerMile) : "-";

  const engineTypeText = watch("engineTypeText");
  const isElectricEngine = engineTypeText === "Electro";
  const isLocationEdited = watch("isLocationEdited");
  const locationInfo = watch("locationInfo");
  const isGuestInsuranceRequired = watch("isGuestInsuranceRequired");

  const vinNumber = watch("vinNumber");

  const [isCarMetadataEdited, setIsCarMetadataEdited] = useState(isNewCar);
  const [selectedMakeID, setSelectedMakeID] = useState<string>("");
  const [selectedModelID, setSelectedModelID] = useState<string>("");

  const [isVINVerified, setIsVINVerified] = useState<boolean>(dimoData ? true : false);
  const [isVINCheckOverriden, setIsVINCheckOverriden] = useState<boolean>(false);

  const isFormEnabled = useMemo<boolean>(() => {
    return isVINVerified || isVINCheckOverriden || !isNewCar;
  }, [isVINVerified, isVINCheckOverriden, isNewCar]);

  const { getVINNumber } = useCarAPI();

  const t_car: TFunction = (name, options) => {
    return t("vehicles." + name, options);
  };

  async function onFormSubmit(formData: CarEditFormValues) {
    const carInfoFormParams: HostCarInfo = {
      carId: formData.carId ?? 0,
      vinNumber: formData.vinNumber,
      brand: formData.brand,
      model: formData.model,
      releaseYear: formData.releaseYear,
      images: formData.images,
      name: formData.name,
      licensePlate: formData.licensePlate,
      licenseState: formData.licenseState,
      seatsNumber: formData.seatsNumber,
      doorsNumber: formData.doorsNumber,
      transmission: formData.transmission,
      color: formData.color,
      description: formData.description,
      pricePerDay: formData.pricePerDay,
      milesIncludedPerDay: formData.milesIncludedPerDay,
      securityDeposit: formData.securityDeposit,
      tankVolumeInGal: formData.engineTypeText === ENGINE_TYPE_PETROL_STRING ? formData.tankVolumeInGal : 0,
      fuelPricePerGal: formData.engineTypeText === ENGINE_TYPE_PETROL_STRING ? formData.fuelPricePerGal : 0,
      locationInfo: formData.locationInfo,
      isLocationEdited: formData.isLocationEdited,
      currentlyListed: formData.currentlyListed,
      engineTypeText: formData.engineTypeText,
      fullBatteryChargePrice:
        formData.engineTypeText === ENGINE_TYPE_ELECTRIC_STRING ? formData.fullBatteryChargePrice : 0,
      timeBufferBetweenTripsInMin: formData.timeBufferBetweenTripsInMin,
      isGuestInsuranceRequired: formData.isGuestInsuranceRequired,
      insurancePerDayPriceInUsd: formData.insurancePerDayPriceInUsd ?? 0,
      ownerAddress: initValue?.ownerAddress ?? "",
      wheelDrive: initValue?.wheelDrive ?? "",
      trunkSize: initValue?.trunkSize ?? "",
      bodyType: initValue?.bodyType ?? "",
      isCarMetadataEdited: isCarMetadataEdited,
      metadataUrl: initValue?.metadataUrl ?? "",
      insurancePriceInUsdCents: formData.insurancePerDayPriceInUsd ?? 0,
      dimoTokenId: formData.dimoTokenId ?? 0,
    };

    const isValidForm = verifyCar(carInfoFormParams);
    const isImageUploaded = !isNewCar || carInfoFormParams.images.length > 0;

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

    setMessage(t("vehicles.wait_loading"));
    const result = await saveCarInfo(carInfoFormParams);

    if (result.ok) {
      if (dimoData) {
        localStorage.removeItem("dimo");
      }
      if (isInvestmentCar) {
        showSuccess(t("vehicles.car_invested"));
      } else {
        if (isNewCar) {
          showSuccess(t("vehicles.car_listed"));
        } else {
          showSuccess(t("vehicles.edited"));
        }
      }
      showSuccess(t("vehicles.successfully_listed"));
      if (isInvestmentCar) {
        router.push("/host/invest");
      } else {
        router.push("/host/vehicles");
      }
    } else {
      if (result.error.message === "NOT_ENOUGH_FUNDS") {
        showError(t("common.add_fund_to_wallet"));
      } else {
        showError(t("vehicles.saving_failed"));
      }
    }
  }

  async function loadCarInfoFromJson(file: File) {
    try {
      const fileText = await file.text();
      const data = JSON.parse(fileText);
      const carKeys = Object.keys(emptyHostCarInfo);
      type CarKeys = keyof CarEditFormValues;

      Object.keys(data).forEach((key) => {
        if (carKeys.includes(key)) {
          setValue(key as CarKeys, data[key]);
        }
      });
    } catch (error) {}
  }

  async function handleBack(e: React.MouseEvent<HTMLButtonElement>) {
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
  }

  if (isVINVerified) {
    getVINNumber(vinNumber).then((vinInfo: VinInfo | undefined) => {
      setValue("brand", vinInfo?.brand ?? "");
      setValue("model", vinInfo?.model ?? "");
      setValue("releaseYear", parseInt(vinInfo?.yearOfProduction ?? "2001"));
    });
  }

  return (
    <APIProvider apiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={["places"]} language="en">
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="mt-4">
          <div className="mb-4 pl-4 text-lg">
            <strong>{t_car("car")}</strong>
          </div>
          <div className="flex flex-wrap gap-4">
            <Controller
              name="vinNumber"
              control={control}
              defaultValue={dimoData ? dimoData.vin : ""}
              render={({ field: { onChange, value } }) =>
                dimoData == null ? (
                  <RntVINCheckingInput
                    id="vinNumber"
                    className="lg:w-60"
                    label={t_car("vin_num")}
                    value={value}
                    isVINCheckOverriden={isVINCheckOverriden}
                    isVINVerified={isVINVerified}
                    placeholder="e.g. 4Y1SL65848Z411439"
                    readOnly={!isNewCar}
                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                    onVINVerified={(verified: boolean) => setIsVINVerified(verified)}
                    onVINCheckOverriden={(overridden) => setIsVINCheckOverriden(overridden)}
                  />
                ) : (
                  <RntInputTransparent
                    value={dimoData.vin}
                    className="lg:w-60"
                    label={t_car("vin_num")}
                    readOnly={true}
                  />
                )
              }
            />
            <Controller
              name="brand"
              control={control}
              defaultValue={dimoData?.definition?.make || ""}
              render={({ field: { onChange, value } }) =>
                isNewCar && !isVINVerified && dimoData === undefined ? (
                  <RntCarMakeSelect
                    id="brand"
                    isTransparentStyle={true}
                    className="lg:min-w-[17ch]"
                    label={t_car("brand")}
                    value={value}
                    readOnly={!isFormEnabled || isVINVerified}
                    onMakeSelect={(newID, newMake) => {
                      onChange(newMake);
                      setSelectedMakeID(newID);
                      setIsCarMetadataEdited(true);
                    }}
                    validationError={errors.brand?.message?.toString()}
                  />
                ) : isNewCar && dimoData !== undefined ? (
                  <RntInputTransparent
                    id="brand"
                    className="lg:w-60"
                    label={t_car("brand")}
                    readOnly={true}
                    value={dimoData.definition.make}
                  />
                ) : (
                  <RntInputTransparent
                    className="lg:w-60"
                    id="brand_text"
                    label={t_car("brand")}
                    readOnly={true}
                    value={value}
                  />
                )
              }
            />
            <Controller
              name="model"
              control={control}
              defaultValue={dimoData?.definition?.model || ""}
              render={({ field: { onChange, value } }) =>
                isNewCar && !isVINVerified && dimoData === undefined ? (
                  <RntCarModelSelect
                    id="model"
                    isTransparentStyle={true}
                    className="lg:min-w-[15ch]"
                    label={t_car("model")}
                    make_id={selectedMakeID}
                    readOnly={!isNewCar || !isFormEnabled}
                    value={value}
                    onModelSelect={(newID: string, newModel) => {
                      onChange(newModel);
                      setSelectedModelID(newID);
                      setIsCarMetadataEdited(true);
                    }}
                    validationError={errors.model?.message?.toString()}
                  />
                ) : isNewCar && dimoData !== undefined ? (
                  <RntInputTransparent
                    id="model"
                    className="lg:w-60"
                    label={t_car("model")}
                    readOnly={true}
                    value={dimoData.definition.model}
                  />
                ) : (
                  <RntInputTransparent
                    className="lg:w-60"
                    id="model_text"
                    label={t_car("model")}
                    readOnly={true}
                    value={value}
                  />
                )
              }
            />
            <Controller
              name="releaseYear"
              control={control}
              defaultValue={dimoData ? Number.parseInt(dimoData.definition.year) : 2001}
              render={({ field: { onChange, value } }) =>
                isNewCar && !isVINVerified && dimoData === undefined ? (
                  <RntCarYearSelect
                    id="releaseYear"
                    isTransparentStyle={true}
                    className="lg:min-w-[12ch]"
                    label={t_car("release")}
                    make_id={selectedMakeID}
                    model_id={selectedModelID}
                    readOnly={!isNewCar || !isFormEnabled}
                    value={value}
                    onYearSelect={(newYear) => {
                      onChange(newYear);
                      setIsCarMetadataEdited(true);
                    }}
                    validationError={errors.releaseYear?.message?.toString()}
                  />
                ) : isNewCar && dimoData !== undefined ? (
                  <RntInputTransparent
                    id="releaseYear"
                    className="lg:w-52"
                    label={t_car("release")}
                    readOnly={true}
                    value={dimoData.definition.year}
                  />
                ) : (
                  <RntInputTransparent
                    className="lg:w-52"
                    id="releaseYear_text"
                    label={t_car("release")}
                    readOnly={true}
                    value={value}
                  />
                )
              }
            />
            <RntInputTransparent
              id="dimoTokenId"
              className="lg:w-40"
              type="text"
              label="Dimo token id"
              readOnly={true}
              value={dimoData?.tokenId || 0}
            />
          </div>
        </div>

        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <>
              <CarAddPhoto
                carImages={field.value}
                readOnly={!isFormEnabled}
                onCarImagesChanged={(newValue) => {
                  field.onChange(newValue);
                  setIsCarMetadataEdited(true);
                }}
                onJsonFileLoaded={loadCarInfoFromJson}
              />
              <RntValidationError validationError={errors.images?.message?.toString()} />
            </>
          )}
        />

        <div className="mt-4">
          <div className="mb-4 pl-4 text-lg">
            <strong>{t_car("car_basics")}</strong>
          </div>
          <div className="flex flex-wrap gap-4">
            <RntInputTransparent
              className="lg:w-60"
              id="name"
              label={t_car("car_name")}
              placeholder="e.g. Eleanor"
              readOnly={!isFormEnabled}
              {...register("name", {
                onChange: () => {
                  setIsCarMetadataEdited(true);
                },
              })}
              validationError={errors.name?.message?.toString()}
            />
            <RntInputTransparent
              className="lg:w-60"
              id="licensePlate"
              label={t_car("licence_plate")}
              placeholder="e.g. ABC-12D"
              readOnly={!isFormEnabled}
              {...register("licensePlate", {
                onChange: () => {
                  setIsCarMetadataEdited(true);
                },
              })}
              validationError={errors.licensePlate?.message?.toString()}
            />
            <RntInputTransparent
              className="lg:w-60"
              id="licenseState"
              label={t_car("licence_state")}
              placeholder="e.g. Florida"
              readOnly={!isFormEnabled}
              {...register("licenseState", {
                onChange: () => {
                  setIsCarMetadataEdited(true);
                },
              })}
              validationError={errors.licenseState?.message?.toString()}
            />

            <Controller
              name="engineTypeText"
              control={control}
              render={({ field }) => (
                <RntFilterSelect
                  className="lg:w-60"
                  id="engineType"
                  isTransparentStyle={true}
                  label={t_car("engine_type")}
                  validationError={errors.engineTypeText?.message?.toString()}
                  value={field.value}
                  disabled={!isFormEnabled}
                  placeholder="Please select"
                  onChange={(e) => {
                    field.onChange(e);
                    if (e.target.value === ENGINE_TYPE_ELECTRIC_STRING) {
                      setValue("transmission", TRANSMISSION_AUTOMATIC_STRING);
                    }
                  }}
                >
                  <RntFilterSelect.Option key="year-engine-type-1" value={ENGINE_TYPE_PETROL_STRING}>
                    {t_car("gasoline")}
                  </RntFilterSelect.Option>
                  <RntFilterSelect.Option key="year-engine-type-2" value={ENGINE_TYPE_ELECTRIC_STRING}>
                    {t_car("electric")}
                  </RntFilterSelect.Option>
                </RntFilterSelect>
              )}
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-4 pl-4 text-lg">
            <strong>{t_car("basic_details")}</strong>
          </div>
          <div className="details flex flex-wrap gap-4">
            <div className="flex flex-col gap-4 max-lg:w-full lg:flex-row">
              <Controller
                name="seatsNumber"
                control={control}
                render={({ field }) => (
                  <RntInputTransparent
                    className="w-full lg:w-40"
                    id="seatsNumber"
                    label={t_car("seats_amount")}
                    placeholder="e.g. 5"
                    readOnly={!isFormEnabled}
                    value={field.value}
                    {...register("seatsNumber", { valueAsNumber: true })}
                    validationError={errors.seatsNumber?.message?.toString()}
                    onChange={(e) => {
                      const inputInvestmentAmount = e.target.value.replace(/\D/g, "") || "0"; // Удаляем всё, кроме цифр
                      const numericValue = Number.parseInt(inputInvestmentAmount, 10);
                      if (Number.isFinite(numericValue)) {
                        setIsCarMetadataEdited(true);
                        field.onChange(numericValue);
                      }
                    }}
                  />
                )}
              />
              <Controller
                name="doorsNumber"
                control={control}
                render={({ field }) => (
                  <RntInputTransparent
                    className="w-full lg:w-40"
                    id="doorsNumber"
                    label={t_car("doors")}
                    placeholder="e.g. 2"
                    readOnly={!isFormEnabled}
                    value={field.value}
                    {...register("doorsNumber", { valueAsNumber: true })}
                    validationError={errors.doorsNumber?.message?.toString()}
                    onChange={(e) => {
                      const inputInvestmentAmount = e.target.value.replace(/\D/g, "") || "0"; // Удаляем всё, кроме цифр
                      const numericValue = Number.parseInt(inputInvestmentAmount, 10);
                      if (Number.isFinite(numericValue)) {
                        setIsCarMetadataEdited(true);
                        field.onChange(numericValue);
                      }
                    }}
                  />
                )}
              />
            </div>
            {!isElectricEngine ? (
              <div className="flex flex-col max-lg:w-full lg:flex-row">
                <Controller
                  name="tankVolumeInGal"
                  control={control}
                  render={({ field }) => (
                    <RntInputTransparent
                      className="w-full lg:w-40"
                      id="tankVolumeInGal"
                      label={t_car("tank_size")}
                      placeholder="e.g. 16"
                      readOnly={!isFormEnabled}
                      value={field.value}
                      {...register("tankVolumeInGal", { valueAsNumber: true })}
                      validationError={
                        "tankVolumeInGal" in errors ? errors.tankVolumeInGal?.message?.toString() : undefined
                      }
                      onChange={(e) => {
                        const inputInvestmentAmount = e.target.value.replace(/\D/g, "") || "0"; // Удаляем всё, кроме цифр
                        const numericValue = Number.parseInt(inputInvestmentAmount, 10);
                        if (Number.isFinite(numericValue)) {
                          setIsCarMetadataEdited(true);
                          field.onChange(numericValue);
                        }
                      }}
                    />
                  )}
                />
                <Controller
                  name="transmission"
                  control={control}
                  render={({ field }) => (
                    <RntFilterSelect
                      className="w-[48%] sm:w-[28%] lg:w-48"
                      containerClassName="lg:ml-4"
                      labelClassName="max-lg:mt-4"
                      id="transmission"
                      isTransparentStyle={true}
                      label={t_car("transmission")}
                      disabled={!isFormEnabled}
                      placeholder="Please select"
                      value={field.value}
                      validationError={errors.transmission?.message?.toString()}
                      onChange={(e) => {
                        field.onChange(e);
                        setIsCarMetadataEdited(true);
                      }}
                    >
                      <RntFilterSelect.Option key="transmission-1" value={TRANSMISSION_MANUAL_STRING}>
                        {t_car("manual")}
                      </RntFilterSelect.Option>
                      <RntFilterSelect.Option key="transmission-2" value={TRANSMISSION_AUTOMATIC_STRING}>
                        {t_car("auto")}
                      </RntFilterSelect.Option>
                    </RntFilterSelect>
                  )}
                />
              </div>
            ) : null}

            <RntInputTransparent
              className="w-full lg:w-40"
              id="color"
              label={t_car("color")}
              placeholder="e.g. Green"
              readOnly={!isFormEnabled}
              {...register("color", {
                onChange: () => {
                  setIsCarMetadataEdited(true);
                },
              })}
              validationError={errors.color?.message?.toString()}
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-col">
            <RntInputMultiline
              rows={5}
              id="description"
              isTransparentStyle={true}
              label={t_car("more_info")}
              labelClassName="font-semibold text-lg"
              placeholder="e.g. Dupont Pepper Grey 1967 Ford Mustang fastback"
              readOnly={!isFormEnabled}
              {...register("description", {
                onChange: () => {
                  setIsCarMetadataEdited(true);
                },
              })}
              validationError={errors.description?.message?.toString()}
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-4 pl-4 text-lg">
            <strong>{t_car("location")}</strong>
          </div>
          <div className="mb-4 flex flex-row items-end gap-4">
            {isLocationEdited ? (
              <Controller
                name="locationInfo"
                control={control}
                render={({ field }) => (
                  <RntPlaceAutocomplete
                    className="lg:w-full"
                    id="address"
                    isAsRntInputTransparent={true}
                    isDarkPlacePredictions={true}
                    label={isNewCar ? t_car("address") : t_car("saved_address")}
                    placeholder="Miami"
                    initValue={autocomplete}
                    includeStreetAddress={true}
                    readOnly={!isLocationEdited || !isFormEnabled}
                    onChange={(e) => setAutocomplete(e.target.value)}
                    onAddressChange={async (placeDetails) => {
                      field.onChange(await placeDetailsToLocationInfoWithTimeZone(placeDetails));
                    }}
                    validationError={errors.locationInfo?.address?.message?.toString()}
                  />
                )}
              />
            ) : (
              <RntInputTransparent
                className="lg:w-full"
                id="address"
                label={isNewCar ? t_car("address") : t_car("saved_address")}
                placeholder="Miami"
                value={autocomplete}
                readOnly={true}
              />
            )}
            <RntButton
              className="h-14 w-40"
              type="button"
              disabled={isLocationEdited || !isFormEnabled}
              onClick={() => setValue("isLocationEdited", true)}
            >
              Edit
            </RntButton>
          </div>

          <div className="flex flex-wrap gap-4">
            <RntInputTransparent
              className="lg:w-40"
              id="country"
              label={t_car("country")}
              labelClassName="pl-4"
              placeholder="USA"
              readOnly={true}
              value={locationInfo?.country}
              validationError={errors.locationInfo?.country?.message?.toString()}
            />
            <RntInputTransparent
              className="lg:w-40"
              id="state"
              label={t_car("state")}
              labelClassName="pl-4"
              placeholder="e.g. Florida"
              readOnly={true}
              value={locationInfo?.state}
              validationError={errors.locationInfo?.state?.message?.toString()}
            />
            <RntInputTransparent
              className="lg:w-40"
              id="city"
              label={t_car("city")}
              labelClassName="pl-4"
              placeholder="e.g. Miami"
              readOnly={true}
              value={locationInfo?.city}
              validationError={errors.locationInfo?.city?.message?.toString()}
            />
            <RntInputTransparent
              className="w-[48%] lg:w-60"
              id="locationLatitude"
              label={t_car("location_lat")}
              labelClassName="pl-4"
              placeholder="e.g. 42.123456"
              readOnly={true}
              value={locationInfo?.latitude}
              validationError={errors.locationInfo?.latitude?.message?.toString()}
            />
            <RntInputTransparent
              className="w-[48%] lg:w-60"
              id="locationLongitude"
              label={t_car("location_long")}
              labelClassName="pl-4"
              placeholder="e.g. 42.123456"
              readOnly={true}
              value={locationInfo?.longitude}
              validationError={errors.locationInfo?.longitude?.message?.toString()}
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-4 pl-4 text-lg">
            <strong>{t_car("included_distance")}</strong>
          </div>
          <Controller
            name="milesIncludedPerDay"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap items-center gap-4">
                <MilesIncludedPerDay
                  value={field.value}
                  readOnly={!isFormEnabled}
                  onChange={field.onChange}
                  validationError={errors.milesIncludedPerDay?.message?.toString()}
                  t_car={t_car}
                />
              </div>
            )}
          />
        </div>

        <div className="mt-4">
          <div className="mb-4 pl-4 text-lg">
            <strong>{t_car("price")}</strong>
          </div>
          <div className="flex flex-wrap gap-4">
            <Controller
              name="pricePerDay"
              control={control}
              render={({ field }) => (
                <RntInputTransparent
                  className="lg:w-60"
                  id="pricePerDay"
                  label={t_car("rent")}
                  placeholder="e.g. 100"
                  readOnly={!isFormEnabled}
                  value={field.value}
                  {...register("pricePerDay", { valueAsNumber: true })}
                  validationError={errors.pricePerDay?.message?.toString()}
                  onChange={(e) => {
                    const inputInvestmentAmount = e.target.value.replace(/\D/g, "") || "0"; // Удаляем всё, кроме цифр
                    const numericValue = Number.parseInt(inputInvestmentAmount, 10);
                    if (Number.isFinite(numericValue)) {
                      setIsCarMetadataEdited(true);
                      field.onChange(numericValue);
                    }
                  }}
                />
              )}
            />
            <Controller
              name="securityDeposit"
              control={control}
              render={({ field }) => (
                <RntInputTransparent
                  className="lg:w-60"
                  id="securityDeposit"
                  label={t_car("secure_dep")}
                  placeholder="e.g. 300"
                  readOnly={!isFormEnabled}
                  value={field.value}
                  {...register("securityDeposit", { valueAsNumber: true })}
                  validationError={errors.securityDeposit?.message?.toString()}
                  onChange={(e) => {
                    const inputInvestmentAmount = e.target.value.replace(/\D/g, "") || "0"; // Удаляем всё, кроме цифр
                    const numericValue = Number.parseInt(inputInvestmentAmount, 10);
                    if (Number.isFinite(numericValue)) {
                      setIsCarMetadataEdited(true);
                      field.onChange(numericValue);
                    }
                  }}
                />
              )}
            />
            {!isElectricEngine ? (
              <Controller
                name="fuelPricePerGal"
                control={control}
                render={({ field }) => (
                  <RntInputTransparent
                    className="lg:w-60"
                    id="fuelPricePerGal"
                    label={t_car("fuel_price")}
                    labelClassName="pl-4"
                    placeholder="e.g. 5.00"
                    readOnly={!isFormEnabled}
                    value={field.value}
                    {...register("fuelPricePerGal", { valueAsNumber: true })}
                    validationError={
                      "fuelPricePerGal" in errors ? errors.fuelPricePerGal?.message?.toString() : undefined
                    }
                    onChange={(e) => {
                      const inputInvestmentAmount = e.target.value.replace(/\D/g, "") || "0"; // Удаляем всё, кроме цифр
                      const numericValue = Number.parseInt(inputInvestmentAmount, 10);
                      if (Number.isFinite(numericValue)) {
                        setIsCarMetadataEdited(true);
                        field.onChange(numericValue);
                      }
                    }}
                  />
                )}
              />
            ) : null}

            <div className="lg:w-60">
              <p>Overmiles price</p>
              <p className="mt-2 text-sm">
                {isUnlimitedMiles(milesIncludedPerDay)
                  ? t_car("unlimited")
                  : t_car("overmiles_fee", { price: fuelPricePerMileText })}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Controller
              name="insurancePerDayPriceInUsd"
              control={control}
              render={({ field }) => (
                <RntInputTransparent
                  className="lg:w-60"
                  id="insurancePerDayPriceInUsd"
                  label={t_car("insurance_per_day")}
                  placeholder="e.g. 25"
                  readOnly={!isGuestInsuranceRequired || !isFormEnabled}
                  value={field.value}
                  {...register("insurancePerDayPriceInUsd", { valueAsNumber: true })}
                  validationError={errors.insurancePerDayPriceInUsd?.message?.toString()}
                  onChange={(e) => {
                    const inputInvestmentAmount = e.target.value.replace(/\D/g, "") || "0"; // Удаляем всё, кроме цифр
                    const numericValue = Number.parseInt(inputInvestmentAmount, 10);
                    if (Number.isFinite(numericValue)) {
                      setIsCarMetadataEdited(true);
                      field.onChange(numericValue);
                    }
                  }}
                />
              )}
            />
            <Controller
              name="isGuestInsuranceRequired"
              control={control}
              render={({ field }) => (
                <CheckboxLight
                  className="mt-7"
                  label={t_car("guest_insurance_required")}
                  readOnly={!isFormEnabled}
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        {isElectricEngine ? (
          <div className={`mt-4 ${isElectricEngine ? "" : "hidden"}`}>
            <div className="mb-4 pl-4 text-lg">
              <strong>{t_car("battery_charge")}</strong>
            </div>
            <Controller
              name="fullBatteryChargePrice"
              control={control}
              render={({ field }) => (
                <FullBatteryChargePrice
                  value={field.value}
                  readOnly={!isFormEnabled}
                  onChange={(newValue) => {
                    field.onChange(newValue);
                  }}
                  validationError={
                    "fullBatteryChargePrice" in errors ? errors.fullBatteryChargePrice?.message?.toString() : undefined
                  }
                  t_car={t_car}
                />
              )}
            />
          </div>
        ) : null}

        <div className="mt-4">
          <div className="mb-4 pl-4 text-lg">
            <strong>{t_car("management")}</strong>
          </div>
          <div className="mb-4 flex flex-wrap gap-4">
            <Controller
              name="timeBufferBetweenTripsInMin"
              control={control}
              render={({ field }) => (
                <RntFilterSelect
                  className="lg:w-60"
                  id="timeBufferBetweenTrips"
                  isTransparentStyle={true}
                  label={t_car("time_buffer")}
                  disabled={!isFormEnabled}
                  value={field.value ?? 0}
                  validationError={errors.timeBufferBetweenTripsInMin?.message?.toString()}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                  }}
                >
                  <RntFilterSelect.Option key="time-buffer-1" value="0">
                    0 min
                  </RntFilterSelect.Option>
                  <RntFilterSelect.Option key="time-buffer-2" value={"15"}>
                    15 min
                  </RntFilterSelect.Option>
                  <RntFilterSelect.Option key="time-buffer-3" value={"30"}>
                    30 min
                  </RntFilterSelect.Option>
                  <RntFilterSelect.Option key="time-buffer-4" value={"60"}>
                    1 hr
                  </RntFilterSelect.Option>
                  <RntFilterSelect.Option key="time-buffer-5" value={"90"}>
                    1.5 hr
                  </RntFilterSelect.Option>
                  <RntFilterSelect.Option key="time-buffer-6" value={"120"}>
                    2 hr
                  </RntFilterSelect.Option>
                  <RntFilterSelect.Option key="time-buffer-7" value={"150"}>
                    2.5 hr
                  </RntFilterSelect.Option>
                  <RntFilterSelect.Option key="time-buffer-8" value={"180"}>
                    3 hr
                  </RntFilterSelect.Option>
                </RntFilterSelect>
              )}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <Controller
              name="currentlyListed"
              control={control}
              render={({ field }) => (
                <RntFilterSelect
                  className="lg:w-60"
                  id="listed"
                  isTransparentStyle={true}
                  label={t_car("listing_status")}
                  value={field.value ? "true" : "false"}
                  disabled={!isFormEnabled}
                  onChange={(e) => {
                    field.onChange(e.target.value === "true");
                  }}
                >
                  <RntFilterSelect.Option key="listing-status-1" value={"true"}>
                    {t_car("listed")}
                  </RntFilterSelect.Option>
                  <RntFilterSelect.Option key="listing-status-2" value={"false"}>
                    {t_car("unlisted")}
                  </RntFilterSelect.Option>
                </RntFilterSelect>
              )}
            />
          </div>
        </div>

        <div className="mb-8 mt-8 flex flex-row justify-between gap-4 sm:justify-start">
          <RntButton
            type="button"
            className="h-14 w-40"
            disabled={isSubmitting}
            onClick={handleSubmit(async (data) => await onFormSubmit(data))}
          >
            {t("common.save")}
          </RntButton>
          <RntButton type="button" className="h-14 w-40" onClick={handleBack}>
            {t("common.back")}
          </RntButton>
        </div>
        <label className="mb-4">{message}</label>
      </form>
    </APIProvider>
  );
}

const MilesIncludedPerDay = ({
  value,
  readOnly,
  onChange,
  validationError,
  t_car,
}: {
  value: number | typeof UNLIMITED_MILES_VALUE_TEXT;
  readOnly: boolean;
  onChange: (value: number | typeof UNLIMITED_MILES_VALUE_TEXT) => void;
  validationError?: string;
  t_car: TFunction;
}) => {
  const [milesIncludedPerDay, setMilesIncludedPerDay] = useState<
    number | typeof UNLIMITED_MILES_VALUE_TEXT | undefined
  >(value);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(isUnlimitedMiles(value));

  useEffect(() => {
    if (!isUnlimitedMiles(value)) {
      setMilesIncludedPerDay(value);
    }
  }, [value]);

  return (
    <>
      {isUnlimited ? (
        <RntInputTransparent
          className="lg:w-60"
          label={t_car("max_mileage")}
          readOnly={true}
          value={UNLIMITED_MILES_VALUE_TEXT}
        />
      ) : (
        <RntInputTransparent
          className="lg:w-60"
          id="milesIncludedPerDay"
          label={t_car("max_mileage")}
          placeholder="e.g. 200"
          value={milesIncludedPerDay}
          readOnly={readOnly}
          onChange={(e) => {
            const newValue =
              e.target.value === UNLIMITED_MILES_VALUE_TEXT ? UNLIMITED_MILES_VALUE_TEXT : Number(e.target.value);
            if (Number.isFinite(newValue) || newValue === UNLIMITED_MILES_VALUE_TEXT) {
              setMilesIncludedPerDay(newValue);
              onChange(newValue);
            }
          }}
          validationError={validationError}
        />
      )}
      <CheckboxLight
        className="mt-7"
        label={t_car("unlimited_miles")}
        checked={isUnlimited}
        readOnly={readOnly}
        onChange={(e) => {
          //setValue("milesIncludedPerDay", e.target.checked ? UNLIMITED_MILES_VALUE : 0)
          //field.onChange(e.target.checked ? UNLIMITED_MILES_VALUE : 0);
          setIsUnlimited(e.target.checked);
          onChange(e.target.checked ? UNLIMITED_MILES_VALUE_TEXT : milesIncludedPerDay ?? 0);
        }}
      />
    </>
  );
};

const FullBatteryChargePrice = ({
  value,
  readOnly,
  onChange,
  validationError,
  t_car,
}: {
  value: number;
  readOnly: boolean;
  onChange: (value: number) => void;
  validationError?: string;
  t_car: TFunction;
}) => {
  const [fullBatteryChargePrice, setFullBatteryChargePrice] = useState<number | undefined>(value);

  useEffect(() => {
    setFullBatteryChargePrice(value);
  }, [value]);

  return (
    <div className="flex flex-wrap gap-4">
      <div>
        <RntInput
          className="lg:w-48"
          id="fullBatteryChargePrice"
          label={t_car("full_charge")}
          placeholder="e.g. 50"
          value={fullBatteryChargePrice}
          readOnly={readOnly}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            if (Number.isFinite(newValue)) {
              setFullBatteryChargePrice(newValue);
              onChange(newValue);
            }
          }}
          validationError={validationError}
        />
        <p className="mt-2 w-full text-center text-sm">{t_car("recommended", { amount: "$30-50" })}</p>
      </div>
      <div>
        <RntInput
          className="lg:w-48"
          id="tenPercentBatteryChargePrice"
          label={t_car("cost_for_each")}
          readOnly={true}
          value={(fullBatteryChargePrice ?? 0) / 10}
        />
        <p className="mt-2 w-full text-center text-sm">{t_car("for_difference")}</p>
      </div>
    </div>
  );
};
