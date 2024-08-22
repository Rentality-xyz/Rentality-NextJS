import RntFileButton from "@/components/common/rntFileButton";
import RntInput from "@/components/common/rntInput";
import RntSelect from "@/components/common/rntSelect";
import {
  emptyHostCarInfo,
  HostCarInfo,
  isUnlimitedMiles,
  UNLIMITED_MILES_VALUE_TEXT,
  verifyCar,
} from "@/model/HostCarInfo";
import Image from "next/image";
import { useEffect, useState } from "react";
import RntPlaceAutocomplete from "@/components/common/rntPlaceAutocomplete";
import RntCheckbox from "@/components/common/rntCheckbox";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PETROL_STRING } from "@/model/EngineType";
import RntButton from "@/components/common/rntButton";
import { GoogleMapsProvider } from "@/contexts/googleMapsContext";
import { TFunction } from "@/utils/i18n";
import { displayMoneyWith2Digits, fixedNumber } from "@/utils/numericFormatters";
import { getTimeZoneIdFromAddress } from "@/utils/fetchTimeZoneId";
import { useRntDialogs, useRntSnackbars } from "@/contexts/rntDialogsContext";
import { DialogActions } from "@/utils/dialogActions";
import { useRouter } from "next/navigation";
import { resizeImage } from "@/utils/image";
import { bigIntReplacer } from "@/utils/json";
import { Controller, useForm } from "react-hook-form";
import { carEditFormSchema, CarEditFormValues } from "./carEditFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import RntInputMultiline from "@/components/common/rntInputMultiline";
import { isEmpty } from "@/utils/string";
import { TRANSMISSION_AUTOMATIC_STRING, TRANSMISSION_MANUAL_STRING } from "@/model/Transmission";
import RntValidationError from "@/components/common/RntValidationError";
import RntCarMakeSelect from "@/components/common/rntCarMakeSelect";
import RntCarModelSelect from "@/components/common/rntCarModelSelect";
import RntCarYearSelect from "@/components/common/rntCarYearSelect";
import RntVINCheckingInput from "@/components/common/rntVINCheckingInput";
import * as React from "react";
import { convertHeicToPng } from "@/utils/heic2any";

export default function CarEditForm({
  initValue,
  isNewCar,
  saveCarInfo,
  t,
}: {
  initValue?: HostCarInfo;
  isNewCar: boolean;
  saveCarInfo: (hostCarInfo: HostCarInfo, image: File) => Promise<boolean>;
  t: TFunction;
}) {
  const router = useRouter();
  const { showDialog, hideDialogs } = useRntDialogs();
  const { showInfo, showError } = useRntSnackbars();

  //const [carInfoFormParams, setCarInfoFormParams] = useState<HostCarInfo>(initValue ?? emptyHostCarInfo);

  const { register, control, handleSubmit, formState, setValue, watch } = useForm<CarEditFormValues>({
    defaultValues:
      !isNewCar && initValue !== undefined
        ? {
            carId: initValue.carId,
            vinNumber: initValue.vinNumber,
            brand: initValue.brand,
            model: initValue.model,
            releaseYear: initValue.releaseYear,

            image: initValue.image,

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
            isInsuranceIncluded: initValue.isInsuranceIncluded,

            timeBufferBetweenTripsInMin: initValue.timeBufferBetweenTripsInMin,
            currentlyListed: initValue.currentlyListed,
          }
        : { carId: 0, isLocationEdited: true, currentlyListed: true },
    resolver: zodResolver(carEditFormSchema),
  });
  const { errors, isSubmitting } = formState;

  const [message, setMessage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [autocomplete, setAutocomplete] = useState(initValue?.locationInfo.address ?? "");

  const pricePerDay = watch("pricePerDay");
  const milesIncludedPerDay = watch("milesIncludedPerDay");

  const fuelPricePerMile = Math.ceil((Number(pricePerDay) * 100) / Number(milesIncludedPerDay)) / 100;
  const fuelPricePerMileText = Number.isFinite(fuelPricePerMile) ? displayMoneyWith2Digits(fuelPricePerMile) : "-";

  const engineTypeText = watch("engineTypeText");
  const isElectricEngine = engineTypeText === "Electro";
  const image = watch("image");
  const isLocationEdited = watch("isLocationEdited");
  const locationInfo = watch("locationInfo");

  const [selectedMakeID, setSelectedMakeID] = useState<string>("");
  const [selectedModelID, setSelectedModelID] = useState<string>("");

  const [isVINVerified, setIsVINVerified] = useState<boolean>(false);
  const [isVINCheckOverriden, setIsVINCheckOverriden] = useState<boolean>(false);

  const t_car: TFunction = (name, options) => {
    return t("vehicles." + name, options);
  };

  const loadCarInfoFromJson = async (file: File) => {
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
  };

  const onChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) {
      return;
    }

    let file = e.target.files[0];

    if (file.type === "application/json") {
      await loadCarInfoFromJson(file);
      return;
    }

    if (file.type.startsWith("image/")) {
      file = await resizeImage(file, 1000);
    } else if (file.size > 5 * 1024 * 1024) {
      alert("File is too big");
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = async function (event) {
      const fileNameExt = file.name.substr(file.name.lastIndexOf(".") + 1);
      if (fileNameExt == "heic") {
        const convertedFile = await convertHeicToPng(file);
        setValue("image", convertedFile.localUrl);
      } else {
        setValue("image", event.target?.result?.toString() ?? "");
      }
    };

    reader.readAsDataURL(file);
  };

  async function onFormSubmit(formData: CarEditFormValues) {
    const carInfoFormParams: HostCarInfo = {
      carId: formData.carId ?? 0,
      vinNumber: formData.vinNumber,
      brand: formData.brand,
      model: formData.model,
      releaseYear: formData.releaseYear,
      image: formData.image,
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
      isInsuranceIncluded: formData.isInsuranceIncluded,
      ownerAddress: "",
      wheelDrive: "",
      trunkSize: "",
      bodyType: "",
    };

    const isValidForm = verifyCar(carInfoFormParams);
    const isImageUploaded = !isNewCar || imageFile !== null;

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

    try {
      setMessage(t("vehicles.wait_loading"));
      const result = await saveCarInfo(carInfoFormParams, imageFile!);

      if (!result) {
        throw new Error("handleSave error");
      }
      if (isNewCar) {
        showInfo(t("vehicles.car_listed"));
      } else {
        showInfo(t("vehicles.edited"));
      }
      router.push("/host/vehicles");
    } catch (e) {
      showError(t("vehicles.saving_failed"));
    } finally {
      setMessage("");
    }
  }

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
    <GoogleMapsProvider libraries={["places"]} language="en">
      <form onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}>
        <div className="mt-4">
          <div className="mb-4 text-lg">
            <strong>{t_car("car")}</strong>
          </div>
          <div className="flex flex-wrap gap-4">
            <Controller
              name="vinNumber"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value } }) => (
                <RntVINCheckingInput
                  id="vinNumber"
                  className="lg:w-60"
                  label={t_car("vin_num")}
                  value={value}
                  isVINCheckOverriden={isVINCheckOverriden}
                  isVINVerified={isVINVerified}
                  placeholder="e.g. 4Y1SL65848Z411439"
                  readOnly={!isNewCar}
                  onChange={(e) => onChange(e.target.value)}
                  onVINVerified={(isVINVerified: boolean) => setIsVINVerified(isVINVerified)}
                  onVINCheckOverriden={(isVINCheckOverriden) => setIsVINCheckOverriden(isVINCheckOverriden)}
                />
              )}
            />
            <Controller
              name="brand"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value } }) => (
                <RntCarMakeSelect
                  id="brand"
                  className="lg:w-60"
                  label={t_car("brand")}
                  readOnly={!isNewCar}
                  value={value}
                  onMakeSelect={(newID, newMake) => {
                    onChange(newMake);
                    setSelectedMakeID(newID);
                  }}
                  validationError={errors.brand?.message?.toString()}
                />
              )}
            />
            <Controller
              name="model"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value } }) => (
                <RntCarModelSelect
                  id="model"
                  className="lg:w-60"
                  label={t_car("model")}
                  make_id={selectedMakeID}
                  readOnly={!isNewCar}
                  value={value}
                  onModelSelect={(newID: string, newModel) => {
                    onChange(newModel);
                    setSelectedModelID(newID);
                  }}
                  validationError={errors.model?.message?.toString()}
                />
              )}
            />
            <Controller
              name="releaseYear"
              control={control}
              defaultValue={0}
              render={({ field: { onChange, value } }) => (
                <RntCarYearSelect
                  id="releaseYear"
                  className="lg:w-60"
                  label={t_car("release")}
                  make_id={selectedMakeID}
                  model_id={selectedModelID}
                  readOnly={!isNewCar}
                  value={value}
                  onYearSelect={(newYear) => onChange(newYear)}
                  validationError={errors.releaseYear?.message?.toString()}
                />
              )}
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-4 text-lg">
            <strong>{t_car("photo")}</strong>
          </div>
          <RntFileButton
            className="h-16 w-40"
            disabled={!isNewCar}
            onChange={onChangeFile}
            accept="image/png,image/jpeg"
          >
            {t("common.upload")}
          </RntFileButton>
          <div className="mt-8 h-60 w-80 overflow-hidden rounded-2xl bg-gray-200 bg-opacity-40">
            {!isEmpty(image) ? (
              <Image className="h-full w-full object-cover" width={1000} height={1000} src={image} alt="" />
            ) : null}
          </div>
          <RntValidationError validationError={errors.image?.message?.toString()} />
        </div>

        <div className="mt-4">
          <div className="mb-4 text-lg">
            <strong>{t_car("car_basics")}</strong>
          </div>
          <div className="flex flex-wrap gap-4">
            <RntInput
              className="lg:w-60"
              id="name"
              label={t_car("car_name")}
              placeholder="e.g. Eleanor"
              readOnly={!isNewCar}
              {...register("name")}
              validationError={errors.name?.message?.toString()}
            />
            <RntInput
              className="lg:w-60"
              id="licensePlate"
              label={t_car("licence_plate")}
              placeholder="e.g. ABC-12D"
              readOnly={!isNewCar}
              {...register("licensePlate")}
              validationError={errors.licensePlate?.message?.toString()}
            />
            <RntInput
              className="lg:w-60"
              id="licenseState"
              label={t_car("licence_state")}
              placeholder="e.g. Florida"
              readOnly={!isNewCar}
              {...register("licenseState")}
              validationError={errors.licenseState?.message?.toString()}
            />

            <Controller
              name="engineTypeText"
              control={control}
              render={({ field }) => (
                <RntSelect
                  className="lg:w-60"
                  id="engineType"
                  label={t_car("engine_type")}
                  readOnly={!isNewCar}
                  validationError={errors.engineTypeText?.message?.toString()}
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    if (e.target.value === ENGINE_TYPE_ELECTRIC_STRING) {
                      setValue("transmission", TRANSMISSION_AUTOMATIC_STRING);
                    }
                  }}
                >
                  <option className="hidden" disabled selected></option>
                  <option value={ENGINE_TYPE_PETROL_STRING}>{t_car("gasoline")}</option>
                  <option value={ENGINE_TYPE_ELECTRIC_STRING}>{t_car("electric")}</option>
                </RntSelect>
              )}
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-4 text-lg">
            <strong>{t_car("basic_details")}</strong>
          </div>
          <div className="details flex flex-wrap gap-4">
            <RntInput
              className="w-[48%] lg:w-40"
              id="seatsNumber"
              label={t_car("seats_amount")}
              placeholder="e.g. 5"
              readOnly={!isNewCar}
              {...register("seatsNumber", { valueAsNumber: true })}
              validationError={errors.seatsNumber?.message?.toString()}
            />
            <RntInput
              className="w-[48%] lg:w-40"
              id="doorsNumber"
              label={t_car("doors")}
              placeholder="e.g. 2"
              readOnly={!isNewCar}
              {...register("doorsNumber", { valueAsNumber: true })}
              validationError={errors.doorsNumber?.message?.toString()}
            />
            {!isElectricEngine ? (
              <>
                <RntInput
                  className="w-[48%] lg:w-40"
                  id="tankVolumeInGal"
                  label={t_car("tank_size")}
                  placeholder="e.g. 16"
                  readOnly={!isNewCar}
                  {...register("tankVolumeInGal", {
                    setValueAs: (v) => (v === "" || v === Number.isNaN(v) ? undefined : parseInt(v, 10)),
                  })}
                  validationError={
                    "tankVolumeInGal" in errors ? errors.tankVolumeInGal?.message?.toString() : undefined
                  }
                />
                <RntSelect
                  className="w-[48%] lg:w-40"
                  id="transmission"
                  label={t_car("transmission")}
                  readOnly={!isNewCar}
                  {...register("transmission")}
                  validationError={errors.transmission?.message?.toString()}
                >
                  <option className="hidden" disabled selected></option>
                  <option value={TRANSMISSION_MANUAL_STRING}>{t_car("manual")}</option>
                  <option value={TRANSMISSION_AUTOMATIC_STRING}>{t_car("auto")}</option>
                </RntSelect>
              </>
            ) : null}

            <RntInput
              className="w-[48%] lg:w-40"
              id="color"
              label={t_car("color")}
              placeholder="e.g. Green"
              readOnly={!isNewCar}
              {...register("color")}
              validationError={errors.color?.message?.toString()}
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-4 text-lg">
            <strong>{t_car("more_info")}</strong>
          </div>
          <div className="flex flex-col">
            <RntInputMultiline
              rows={5}
              id="description"
              placeholder="e.g. Dupont Pepper Grey 1967 Ford Mustang fastback"
              disabled={!isNewCar}
              {...register("description")}
              validationError={errors.description?.message?.toString()}
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-4 text-lg">
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
                    label={isNewCar ? t_car("address") : t_car("saved_address")}
                    placeholder="Miami"
                    initValue={autocomplete}
                    includeStreetAddress={true}
                    readOnly={!isLocationEdited}
                    onChange={(e) => setAutocomplete(e.target.value)}
                    onAddressChange={async (placeDetails) => {
                      const locationAddress = placeDetails.addressString;
                      const country = placeDetails.country?.short_name ?? "";
                      const state = placeDetails.state?.long_name ?? "";
                      const city = placeDetails.city?.long_name ?? "";
                      const latitude = fixedNumber(placeDetails.location?.latitude ?? 0, 6);
                      const longitude = fixedNumber(placeDetails.location?.longitude ?? 0, 6);
                      const timeZoneId = await getTimeZoneIdFromAddress(latitude, longitude);
                      field.onChange({
                        address: locationAddress,
                        country: country,
                        state: state,
                        city: city,
                        latitude: latitude,
                        longitude: longitude,
                        timeZoneId: timeZoneId,
                      });
                    }}
                    validationError={errors.locationInfo?.address?.message?.toString()}
                  />
                )}
              />
            ) : (
              <RntInput
                className="lg:w-full"
                id="address"
                label={isNewCar ? t_car("address") : t_car("saved_address")}
                placeholder="Miami"
                value={autocomplete}
                readOnly={true}
              />
            )}
            <RntButton
              className="w-40"
              type="button"
              disabled={isLocationEdited}
              onClick={() => setValue("isLocationEdited", true)}
            >
              Edit
            </RntButton>
          </div>

          <div className="flex flex-wrap gap-4">
            <RntInput
              className="lg:w-40"
              id="country"
              label={t_car("country")}
              placeholder="USA"
              readOnly={true}
              value={locationInfo?.country}
            />
            <RntInput
              className="lg:w-40"
              id="state"
              label={t_car("state")}
              placeholder="e.g. Florida"
              readOnly={true}
              value={locationInfo?.state}
            />
            <RntInput
              className="lg:w-40"
              id="city"
              label={t_car("city")}
              placeholder="e.g. Miami"
              readOnly={true}
              value={locationInfo?.city}
            />
            <RntInput
              className="w-[48%] lg:w-60"
              id="locationLatitude"
              label={t_car("location_lat")}
              placeholder="e.g. 42.123456"
              readOnly={true}
              value={locationInfo?.latitude}
            />
            <RntInput
              className="w-[48%] lg:w-60"
              id="locationLongitude"
              label={t_car("location_long")}
              placeholder="e.g. 42.123456"
              readOnly={true}
              value={locationInfo?.longitude}
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-4 text-lg">
            <strong>{t_car("included_distance")}</strong>
          </div>
          <Controller
            name="milesIncludedPerDay"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap items-start gap-4">
                <MilesIncludedPerDay
                  value={field.value}
                  onChange={field.onChange}
                  validationError={errors.milesIncludedPerDay?.message?.toString()}
                  t_car={t_car}
                />
              </div>
            )}
          />
        </div>

        <div className="mt-4">
          <div className="mb-4 text-lg">
            <strong>{t_car("price")}</strong>
          </div>
          <div className="flex flex-wrap gap-4">
            <RntInput
              className="lg:w-60"
              id="pricePerDay"
              label={t_car("rent")}
              placeholder="e.g. 100"
              {...register("pricePerDay", { valueAsNumber: true })}
              validationError={errors.pricePerDay?.message?.toString()}
            />
            <RntInput
              className="lg:w-60"
              id="securityDeposit"
              label={t_car("secure_dep")}
              placeholder="e.g. 300"
              {...register("securityDeposit", { valueAsNumber: true })}
              validationError={errors.securityDeposit?.message?.toString()}
            />
            {!isElectricEngine ? (
              <RntInput
                className="lg:w-60"
                id="fuelPricePerGal"
                label={t_car("fuel_price")}
                placeholder="e.g. 5.00"
                {...register("fuelPricePerGal", {
                  setValueAs: (v) => (v === "" || v === Number.isNaN(v) ? undefined : parseInt(v, 10)),
                })}
                validationError={"fuelPricePerGal" in errors ? errors.fuelPricePerGal?.message?.toString() : undefined}
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

          <Controller
            name="isInsuranceIncluded"
            control={control}
            render={({ field }) => (
              <RntCheckbox
                className="mt-4"
                label={t_car("insurance_included")}
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        {isElectricEngine ? (
          <div className={`mt-4 ${isElectricEngine ? "" : "hidden"}`}>
            <div className="mb-4 text-lg">
              <strong>{t_car("battery_charge")}</strong>
            </div>
            <Controller
              name="fullBatteryChargePrice"
              control={control}
              render={({ field }) => (
                <FullBatteryChargePrice
                  value={field.value}
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
          <div className="mb-4 text-lg">
            <strong>{t_car("management")}</strong>
          </div>
          <div className="mb-4 flex flex-wrap gap-4">
            <RntSelect
              className="lg:w-60"
              id="timeBufferBetweenTrips"
              label={t_car("time_buffer")}
              {...register("timeBufferBetweenTripsInMin", { valueAsNumber: true })}
              validationError={errors.timeBufferBetweenTripsInMin?.message?.toString()}
            >
              <option value="0">0 min</option>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="60">1 hr</option>
              <option value="90">1.5 hr</option>
              <option value="120">2 hr</option>
              <option value="150">2.5 hr</option>
              <option value="180">3 hr</option>
            </RntSelect>
          </div>
          <div className="flex flex-wrap gap-4">
            <Controller
              name="currentlyListed"
              control={control}
              render={({ field }) => (
                <RntSelect
                  className="lg:w-60"
                  id="listed"
                  label={t_car("listing_status")}
                  value={field.value ? "true" : "false"}
                  onChange={(e) => {
                    field.onChange(e.target.value === "true");
                  }}
                >
                  <option value="true">{t_car("listed")}</option>
                  <option value="false">{t_car("unlisted")}</option>
                </RntSelect>
              )}
            />
          </div>
        </div>

        <div className="mb-8 mt-8 flex flex-row justify-between gap-4 sm:justify-start">
          <RntButton type="submit" className="h-16 w-40" disabled={isSubmitting}>
            {t("common.save")}
          </RntButton>
          <RntButton type="button" className="h-16 w-40" onClick={handleBack}>
            {t("common.back")}
          </RntButton>
        </div>
        <label className="mb-4">{message}</label>
      </form>
    </GoogleMapsProvider>
  );
}

const MilesIncludedPerDay = ({
  value,
  onChange,
  validationError,
  t_car,
}: {
  value: number | typeof UNLIMITED_MILES_VALUE_TEXT;
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
        <RntInput className="lg:w-60" label={t_car("max_mileage")} readOnly={true} value={UNLIMITED_MILES_VALUE_TEXT} />
      ) : (
        <RntInput
          className="lg:w-60"
          id="milesIncludedPerDay"
          label={t_car("max_mileage")}
          placeholder="e.g. 200"
          value={milesIncludedPerDay}
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
      <RntCheckbox
        className="ml-4 mt-8"
        label={t_car("unlimited_miles")}
        checked={isUnlimited}
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
  onChange,
  validationError,
  t_car,
}: {
  value: number;
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
