import RntFileButton from "@/components/common/rntFileButton";
import RntInput from "@/components/common/rntInput";
import RntSelect from "@/components/common/rntSelect";
import { HostCarInfo, UNLIMITED_MILES_VALUE_TEXT } from "@/model/HostCarInfo";
import Image from "next/image";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import RntPlaceAutocomplete from "@/components/common/rntPlaceAutocomplete";
import RntCheckbox from "@/components/common/rntCheckbox";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PETROL_STRING } from "@/model/EngineType";
import RntButton from "@/components/common/rntButton";
import { GoogleMapsProvider } from "@/contexts/googleMapsContext";
import { TFunction } from "@/utils/i18n";
import { displayMoneyWith2Digits, fixedNumber } from "@/utils/numericFormatters";
import { UTC_TIME_ZONE_ID } from "@/utils/date";

const getTimeZoneIdFromAddress = async (latitude: number, longitude: number) => {
  if (longitude === 0) return UTC_TIME_ZONE_ID;

  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("getTimeZoneIdFromAddress error: GOOGLE_MAPS_API_KEY was not set");
    return "";
  }

  var googleTimeZoneResponse = await fetch(
    `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=0&key=${GOOGLE_MAPS_API_KEY}`
  );
  if (!googleTimeZoneResponse.ok) {
    console.error(`getUtcOffsetMinutesFromLocation error: googleTimeZoneResponse is ${googleTimeZoneResponse.status}`);
    return UTC_TIME_ZONE_ID;
  }

  const googleTimeZoneJson = await googleTimeZoneResponse.json();

  return googleTimeZoneJson?.timeZoneId ?? UTC_TIME_ZONE_ID;
};

export default function CarEditForm({
  carInfoFormParams,
  setCarInfoFormParams,
  onImageFileChange,
  isNewCar,
  t,
}: {
  carInfoFormParams: HostCarInfo;
  setCarInfoFormParams: Dispatch<SetStateAction<HostCarInfo>>;
  onImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isNewCar: boolean;
  t: TFunction;
}) {
  const [autocomplete, setAutocomplete] = useState(carInfoFormParams.locationInfo.address);
  const isUnlimitedMiles = carInfoFormParams.milesIncludedPerDay === UNLIMITED_MILES_VALUE_TEXT;
  const fuelPricePerMile = Number(carInfoFormParams.pricePerDay) / Number(carInfoFormParams.milesIncludedPerDay);
  const fuelPricePerMileText = Number.isFinite(fuelPricePerMile) ? displayMoneyWith2Digits(fuelPricePerMile) : "-";
  const isElectricEngine = carInfoFormParams.engineTypeText === "Electro";

  const t_car: TFunction = (name, options) => {
    return t("vehicles." + name, options);
  };

  return (
    <GoogleMapsProvider libraries={["places"]}>
      <div className="mt-4">
        <div className="text-lg mb-4">
          <strong>{t_car("car")}</strong>
        </div>
        <div className="flex flex-wrap gap-4">
          <RntInput
            className="lg:w-60"
            id="vinNumber"
            label={t_car("vin_num")}
            placeholder="e.g. 4Y1SL65848Z411439"
            readOnly={!isNewCar}
            value={carInfoFormParams.vinNumber}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                vinNumber: e.target.value,
              })
            }
          />
          <RntInput
            className="lg:w-60"
            id="brand"
            label={t_car("brand")}
            placeholder="e.g. Shelby"
            readOnly={!isNewCar}
            value={carInfoFormParams.brand}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                brand: e.target.value,
              })
            }
          />
          <RntInput
            className="lg:w-60"
            id="model"
            label={t_car("model")}
            placeholder="e.g. Mustang GT500"
            readOnly={!isNewCar}
            value={carInfoFormParams.model}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                model: e.target.value,
              })
            }
          />
          <RntInput
            className="lg:w-60"
            id="releaseYear"
            label={t_car("release")}
            placeholder="e.g. 2023"
            readOnly={!isNewCar}
            value={carInfoFormParams.releaseYear}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                releaseYear: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-lg mb-4">
          <strong>{t_car("photo")}</strong>
        </div>
        <RntFileButton className="w-40 h-16" disabled={!isNewCar} onChange={onImageFileChange}>
          {t("common.upload")}
        </RntFileButton>
        <div className="w-80 h-60 rounded-2xl mt-8 overflow-hidden bg-gray-200 bg-opacity-40">
          {carInfoFormParams.image != null && carInfoFormParams.image.length > 0 ? (
            <Image
              className="h-full w-full object-cover"
              width={1000}
              height={1000}
              src={carInfoFormParams.image}
              alt=""
            />
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-lg mb-4">
          <strong>{t_car("car_basics")}</strong>
        </div>
        <div className="flex flex-wrap gap-4">
          <RntInput
            className="lg:w-60"
            id="name"
            label={t_car("car_name")}
            placeholder="e.g. Eleanor"
            readOnly={!isNewCar}
            value={carInfoFormParams.name}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                name: e.target.value,
              })
            }
          />
          <RntInput
            className="lg:w-60"
            id="licensePlate"
            label={t_car("licence_plate")}
            placeholder="e.g. ABC-12D"
            readOnly={!isNewCar}
            value={carInfoFormParams.licensePlate}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                licensePlate: e.target.value,
              })
            }
          />
          <RntInput
            className="lg:w-60"
            id="licenseState"
            label={t_car("licence_state")}
            placeholder="e.g. Florida"
            readOnly={!isNewCar}
            value={carInfoFormParams.licenseState}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                licenseState: e.target.value,
              })
            }
          />
          <RntSelect
            className="lg:w-60"
            id="engineType"
            label={t_car("engine_type")}
            readOnly={!isNewCar}
            value={carInfoFormParams.engineTypeText}
            onChange={(e) => {
              if (e.target.value === ENGINE_TYPE_ELECTRIC_STRING) {
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  engineTypeText: e.target.value,
                  transmission: "Automatic",
                });
              } else {
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  engineTypeText: e.target.value,
                });
              }
            }}
          >
            <option className="hidden" disabled></option>
            <option value={ENGINE_TYPE_PETROL_STRING}>{t_car("gasoline")}</option>
            <option value={ENGINE_TYPE_ELECTRIC_STRING}>{t_car("electric")}</option>
          </RntSelect>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-lg  mb-4">
          <strong>{t_car("basic_details")}</strong>
        </div>
        <div className="details flex flex-wrap gap-4">
          <RntInput
            className="w-[48%] lg:w-40"
            id="seatsNumber"
            label={t_car("seats_amount")}
            placeholder="e.g. 5"
            readOnly={!isNewCar}
            value={carInfoFormParams.seatsNumber}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                seatsNumber: e.target.value,
              })
            }
          />
          <RntInput
            className="w-[48%] lg:w-40"
            id="doorsNumber"
            label={t_car("doors")}
            placeholder="e.g. 2"
            readOnly={!isNewCar}
            value={carInfoFormParams.doorsNumber}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                doorsNumber: e.target.value,
              })
            }
          />
          {!isElectricEngine ? (
            <>
              <RntInput
                className="w-[48%] lg:w-40"
                id="tankVolumeInGal"
                label={t_car("tank_size")}
                placeholder="e.g. 16"
                readOnly={!isNewCar}
                value={carInfoFormParams.tankVolumeInGal}
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    tankVolumeInGal: e.target.value,
                  })
                }
              />
              <RntSelect
                className="w-[48%] lg:w-40"
                id="transmission"
                label={t_car("transmission")}
                readOnly={!isNewCar}
                value={carInfoFormParams.transmission}
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    transmission: e.target.value,
                  })
                }
              >
                <option className="hidden" disabled></option>
                <option value="Manual">{t_car("manual")}</option>
                <option value="Automatic">{t_car("auto")}</option>
              </RntSelect>
            </>
          ) : null}

          <RntInput
            className="w-[48%] lg:w-40"
            id="color"
            label={t_car("color")}
            placeholder="e.g. Green"
            readOnly={!isNewCar}
            value={carInfoFormParams.color}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                color: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-lg  mb-4">
          <strong>{t_car("more_info")}</strong>
        </div>
        <div className="flex flex-col">
          <textarea
            className="text-black w-full px-4 py-2 border-2 rounded-2xl disabled:bg-gray-300 disabled:text-gray-600"
            rows={5}
            id="description"
            placeholder="e.g. Dupont Pepper Grey 1967 Ford Mustang fastback"
            disabled={!isNewCar}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                description: e.target.value,
              })
            }
            value={carInfoFormParams.description}
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-lg mb-4">
          <strong>{t_car("location")}</strong>
        </div>
        <div className="flex flex-row gap-4 items-end  mb-4">
          {carInfoFormParams.isLocationEdited ? (
            <RntPlaceAutocomplete
              className="lg:w-full"
              id="address"
              label={isNewCar ? t_car("address") : t_car("saved_address")}
              placeholder="Miami"
              initValue={autocomplete}
              includeStreetAddress={true}
              readOnly={!carInfoFormParams.isLocationEdited}
              onChange={(e) => setAutocomplete(e.target.value)}
              onAddressChange={async (placeDetails) => {
                const locationAddress = placeDetails.addressString;
                const country = placeDetails.country?.short_name ?? "";
                const state = placeDetails.state?.long_name ?? "";
                const city = placeDetails.city?.long_name ?? "";
                const latitude = fixedNumber(placeDetails.location?.latitude ?? 0, 6);
                const longitude = fixedNumber(placeDetails.location?.longitude ?? 0, 6);
                const timeZoneId = await getTimeZoneIdFromAddress(latitude, longitude);

                setCarInfoFormParams({
                  ...carInfoFormParams,
                  locationInfo: {
                    address: locationAddress,
                    country: country,
                    state: state,
                    city: city,
                    latitude: latitude,
                    longitude: longitude,
                    timeZoneId: timeZoneId,
                  },
                });
              }}
            />
          ) : (
            <RntInput
              className="lg:w-full"
              id="address"
              label={isNewCar ? t_car("address") : t_car("saved_address")}
              placeholder="Miami"
              value={autocomplete}
              readOnly={!carInfoFormParams.isLocationEdited}
            />
          )}
          <RntButton
            className="w-40"
            disabled={carInfoFormParams.isLocationEdited}
            onClick={() =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                isLocationEdited: true,
              })
            }
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
            value={carInfoFormParams.locationInfo.country}
          />
          <RntInput
            className="lg:w-40"
            id="state"
            label={t_car("state")}
            placeholder="e.g. Florida"
            readOnly={true}
            value={carInfoFormParams.locationInfo.state}
          />
          <RntInput
            className="lg:w-40"
            id="city"
            label={t_car("city")}
            placeholder="e.g. Miami"
            readOnly={true}
            value={carInfoFormParams.locationInfo.city}
          />
          <RntInput
            className="w-[48%] lg:w-60"
            id="locationLatitude"
            label={t_car("location_lat")}
            placeholder="e.g. 42.123456"
            readOnly={true}
            value={carInfoFormParams.locationInfo.latitude}
          />
          <RntInput
            className="w-[48%] lg:w-60"
            id="locationLongitude"
            label={t_car("location_long")}
            placeholder="e.g. 42.123456"
            readOnly={true}
            value={carInfoFormParams.locationInfo.longitude}
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-lg  mb-4">
          <strong>{t_car("included_distance")}</strong>
        </div>
        {/* <div className="flex flex-col lg:flex-row"> */}
        <div className="flex flex-wrap gap-4 items-end">
          <RntInput
            className="lg:w-60"
            id="milesIncludedPerDay"
            label={t_car("max_mileage")}
            readOnly={isUnlimitedMiles}
            placeholder="e.g. 200"
            value={carInfoFormParams.milesIncludedPerDay}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                milesIncludedPerDay: e.target.value,
              })
            }
          />
          <RntCheckbox
            className="ml-4"
            title={t_car("unlimited_miles")}
            value={isUnlimitedMiles}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                milesIncludedPerDay: e.target.checked ? UNLIMITED_MILES_VALUE_TEXT : "",
              })
            }
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-lg  mb-4">
          <strong>{t_car("price")}</strong>
        </div>
        <div className="flex flex-wrap gap-4">
          <RntInput
            className="lg:w-60"
            id="pricePerDay"
            label={t_car("rent")}
            placeholder="e.g. 100"
            value={carInfoFormParams.pricePerDay}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                pricePerDay: e.target.value,
              })
            }
          />
          <RntInput
            className="lg:w-60"
            id="securityDeposit"
            label={t_car("secure_dep")}
            placeholder="e.g. 300"
            value={carInfoFormParams.securityDeposit}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                securityDeposit: e.target.value,
              })
            }
          />
          {!isElectricEngine ? (
            <RntInput
              className="lg:w-60"
              id="fuelPricePerGal"
              label={t_car("fuel_price")}
              placeholder="e.g. 5.00"
              value={carInfoFormParams.fuelPricePerGal}
              onChange={(e) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  fuelPricePerGal: e.target.value,
                })
              }
            />
          ) : null}

          <div className="lg:w-60">
            <p>Overmiles price</p>
            <p className="mt-2 text-sm">
              {isUnlimitedMiles ? t_car("unlimited") : t_car("overmiles_fee", { price: fuelPricePerMileText })}
            </p>
          </div>
        </div>
        <RntCheckbox
          className="mt-4"
          title={t_car("insurance_included")}
          value={carInfoFormParams.isInsuranceIncluded}
          onChange={(e) =>
            setCarInfoFormParams({
              ...carInfoFormParams,
              isInsuranceIncluded: e.target.checked,
            })
          }
        />
      </div>

      {isElectricEngine ? (
        <div className={`mt-4 ${isElectricEngine ? "" : "hidden"}`}>
          <div className="text-lg  mb-4">
            <strong>{t_car("battery_charge")}</strong>
          </div>
          <div className="flex flex-wrap gap-4 ">
            <div>
              <RntInput
                className="lg:w-48"
                id="fullBatteryChargePrice"
                label={t_car("full_charge")}
                placeholder="e.g. 50"
                value={carInfoFormParams.fullBatteryChargePrice}
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    fullBatteryChargePrice: e.target.value,
                  })
                }
              />
              <p className="w-full text-sm text-center mt-2">{t_car("recommended", { amount: "$30-50" })}</p>
            </div>
            <div>
              <RntInput
                className="lg:w-48"
                id="10PercentBatteryChargePrice"
                label={t_car("cost_for_each")}
                readOnly={true}
                value={(Number(carInfoFormParams.fullBatteryChargePrice) / 10).toString()}
              />
              <p className="w-full text-sm text-center mt-2">{t_car("for_difference")}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <div className="text-lg  mb-4">
          <strong>{t_car("management")}</strong>
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <RntSelect
            className="lg:w-60"
            id="timeBufferBetweenTrips"
            label={t_car("time_buffer")}
            value={carInfoFormParams.timeBufferBetweenTripsInMin.toString()}
            onChange={(e) => {
              setCarInfoFormParams({
                ...carInfoFormParams,
                timeBufferBetweenTripsInMin: Number(e.target.value) ?? 0,
              });
            }}
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
          <RntSelect
            className="lg:w-60"
            id="listed"
            label={t_car("listing_status")}
            value={carInfoFormParams.currentlyListed.toString()}
            onChange={(e) => {
              setCarInfoFormParams({
                ...carInfoFormParams,
                currentlyListed: e.target.value === "true",
              });
            }}
          >
            <option value="true">{t_car("listed")}</option>
            <option value="false">{t_car("unlisted")}</option>
          </RntSelect>
        </div>
      </div>
    </GoogleMapsProvider>
  );
}
