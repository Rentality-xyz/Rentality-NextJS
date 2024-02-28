import RntFileButton from "@/components/common/rntFileButton";
import RntInput from "@/components/common/rntInput";
import RntSelect from "@/components/common/rntSelect";
import { HostCarInfo, UNLIMITED_MILES_VALUE_TEXT } from "@/model/HostCarInfo";
import Image from "next/image";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import RntPlaceAutocomplete from "@/components/common/rntPlaceAutocomplete";
import Checkbox from "@/components/common/checkbox";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PATROL_STRING } from "@/model/EngineType";
import RntButton from "@/components/common/rntButton";

export default function CarEditForm({
  carInfoFormParams,
  setCarInfoFormParams,
  onImageFileChange,
  isNewCar,
}: {
  carInfoFormParams: HostCarInfo;
  setCarInfoFormParams: Dispatch<SetStateAction<HostCarInfo>>;
  onImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isNewCar: boolean;
}) {
  const [autocomplete, setAutocomplete] = useState("");
  const isUnlimitedMiles = carInfoFormParams.milesIncludedPerDay === UNLIMITED_MILES_VALUE_TEXT;
  const fuelPricePerMile = Number(carInfoFormParams.pricePerDay) / Number(carInfoFormParams.milesIncludedPerDay);
  const fuelPricePerMileText = Number.isFinite(fuelPricePerMile) ? fuelPricePerMile.toString() : "-";
  const isElectricEngine = carInfoFormParams.engineTypeString === "Electro";

  useEffect(() => {
    if (!carInfoFormParams.locationLatitude || !carInfoFormParams.locationLongitude) return;

    const getGoogleAddress = async () => {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${carInfoFormParams.locationLatitude},${carInfoFormParams.locationLongitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=en`
      );
      const result = await response.json();
      const firstAddress = result?.results[0]?.formatted_address ?? "";

      if (firstAddress) {
        setAutocomplete(firstAddress);
      }
    };
    getGoogleAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="mt-4">
        <div className="text-lg mb-4">
          <strong>Car</strong>
        </div>
        <div className="flex flex-wrap gap-4">
          <RntInput
            className="lg:w-60"
            id="vinNumber"
            label="VIN number"
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
            label="Brand"
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
            label="Model"
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
            label="Year of manufacture"
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
          <strong>Photo</strong>
        </div>
        <RntFileButton className="w-40 h-16" disabled={!isNewCar} onChange={onImageFileChange}>
          Upload
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
          <strong>Car Basics</strong>
        </div>
        <div className="flex flex-wrap gap-4">
          <RntInput
            className="lg:w-60"
            id="name"
            label="Car name"
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
            label="License plate number"
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
            label="License state"
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
            label="Type of engine"
            readOnly={!isNewCar}
            value={carInfoFormParams.engineTypeString}
            onChange={(e) => {
              if (e.target.value === ENGINE_TYPE_ELECTRIC_STRING) {
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  engineTypeString: e.target.value,
                  transmission: "Automatic",
                });
              } else {
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  engineTypeString: e.target.value,
                });
              }
            }}
          >
            <option className="hidden" disabled></option>
            <option value={ENGINE_TYPE_PATROL_STRING}>Gasoline and Hybrib</option>
            <option value={ENGINE_TYPE_ELECTRIC_STRING}>Electric Vehicle</option>
          </RntSelect>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-lg  mb-4">
          <strong>Basic car details</strong>
        </div>
        <div className="details flex flex-wrap gap-4">
          <RntInput
            className="w-[48%] lg:w-40"
            id="seatsNumber"
            label="Number of seats"
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
            label="Number of doors"
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
                label="Tank size in gal"
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
                label="Transmission"
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
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </RntSelect>
            </>
          ) : null}

          <RntInput
            className="w-[48%] lg:w-40"
            id="color"
            label="Color"
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
          <strong>More about the car</strong>
        </div>
        <div className="flex flex-col">
          <textarea
            className="text-black w-full px-4 py-2 border-2 rounded-2xl"
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
          <strong>Location of vehicle availability</strong>
        </div>
        <div className="flex flex-row gap-4 items-end  mb-4">
          <RntPlaceAutocomplete
            className="lg:w-full"
            id="address"
            label={isNewCar ? "Address" : "Address (based on saved location)"}
            placeholder="Miami"
            initValue={autocomplete}
            includeStreetAddress={true}
            readOnly={!carInfoFormParams.isLocationAddressEdited}
            onChange={(e) => setAutocomplete(e.target.value)}
            onAddressChange={(placeDetails) => {
              const country = placeDetails.country?.short_name ?? "";
              const state = placeDetails.state?.long_name ?? "";
              const city = placeDetails.city?.long_name ?? "";
              const latitude = Math.round(placeDetails.location.latitude * 1_000_000) / 1_000_000;
              const longitude = Math.round(placeDetails.location.longitude * 1_000_000) / 1_000_000;

              setCarInfoFormParams({
                ...carInfoFormParams,
                locationAddress: placeDetails.addressString,
                country: country,
                state: state,
                city: city,
                locationLatitude: latitude.toString(),
                locationLongitude: longitude.toString(),
              });
            }}
          />
          <RntButton
            className="w-40"
            disabled={carInfoFormParams.isLocationAddressEdited}
            onClick={() =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                isLocationAddressEdited: true,
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
            label="Country"
            placeholder="USA"
            readOnly={true}
            value={carInfoFormParams.country}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                country: e.target.value,
              })
            }
          />
          <RntInput
            className="lg:w-40"
            id="state"
            label="State"
            placeholder="e.g. Florida"
            readOnly={true}
            value={carInfoFormParams.state}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                state: e.target.value,
              })
            }
          />
          <RntInput
            className="lg:w-40"
            id="city"
            label="City"
            placeholder="e.g. Miami"
            readOnly={true}
            value={carInfoFormParams.city}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                city: e.target.value,
              })
            }
          />
          <RntInput
            className="w-[48%] lg:w-60"
            id="locationLatitude"
            label="Car location latitude"
            placeholder="e.g. 42.12345"
            readOnly={true}
            value={carInfoFormParams.locationLatitude}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                locationLatitude: e.target.value,
              })
            }
          />
          <RntInput
            className="w-[48%] lg:w-60"
            id="locationLongitude"
            label="Car location longitude"
            placeholder="e.g. 42.12345"
            readOnly={true}
            value={carInfoFormParams.locationLongitude}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                locationLongitude: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-lg  mb-4">
          <strong>Enabled distance</strong>
        </div>
        {/* <div className="flex flex-col lg:flex-row"> */}
        <div className="flex flex-wrap gap-4 items-end">
          <RntInput
            className="lg:w-60"
            id="milesIncludedPerDay"
            label="Number of miles per day"
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
          <Checkbox
            className="ml-4"
            title="Unlimited miles"
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
          <strong>Price</strong>
        </div>
        <div className="flex flex-wrap gap-4">
          <RntInput
            className="lg:w-60"
            id="pricePerDay"
            label="Rental price"
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
            label="Security deposit"
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
              label="Fuel price per gal"
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
              {isUnlimitedMiles ? "Unlimited" : `$${fuelPricePerMileText}/mi fee for additional miles driven`}
            </p>
          </div>
        </div>
      </div>

      {isElectricEngine ? (
        <div className={`mt-4 ${isElectricEngine ? "" : "hidden"}`}>
          <div className="text-lg  mb-4">
            <strong>Battery charge price:</strong>
          </div>
          <div className="flex flex-wrap gap-4 ">
            <div>
              <RntInput
                className="lg:w-48"
                labelClassName="self-center"
                id="0_20"
                label="0-20%"
                placeholder="e.g. 30"
                value={carInfoFormParams.batteryPrice_0_20}
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    batteryPrice_0_20: e.target.value,
                  })
                }
              />
              <p className="w-full text-sm text-center mt-2">Recommended $30-50</p>
            </div>
            <div>
              <RntInput
                className="lg:w-48"
                labelClassName="self-center"
                id="21_50"
                label="21-50%"
                placeholder="e.g. 20"
                value={carInfoFormParams.batteryPrice_21_50}
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    batteryPrice_21_50: e.target.value,
                  })
                }
              />
              <p className="w-full text-sm text-center mt-2">Recommended $20-30</p>
            </div>
            <div>
              <RntInput
                className="lg:w-48"
                labelClassName="self-center"
                id="51_80"
                label="51-80%"
                placeholder="e.g. 5"
                value={carInfoFormParams.batteryPrice_51_80}
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    batteryPrice_51_80: e.target.value,
                  })
                }
              />
              <p className="w-full text-sm text-center mt-2">Recommended $5-20</p>
            </div>
            <div>
              <RntInput
                className="lg:w-48"
                labelClassName="self-center"
                id="81_100"
                label="81-100%"
                readOnly={true}
                value={"Non-refundable"}
                onChange={(e) => {}}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <div className="text-lg  mb-4">
          <strong>Vehicle management</strong>
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <RntSelect
            className="lg:w-60"
            id="timeBufferBetweenTrips"
            label="Time buffer between trips"
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
            label="Listing status"
            value={carInfoFormParams.currentlyListed.toString()}
            onChange={(e) => {
              setCarInfoFormParams({
                ...carInfoFormParams,
                currentlyListed: e.target.value === "true",
              });
            }}
          >
            <option value="true">Listed</option>
            <option value="false">Unlisted</option>
          </RntSelect>
        </div>
      </div>
    </>
  );
}
