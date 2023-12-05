import RntFileButton from "@/components/common/rntFileButton";
import RntInput from "@/components/common/rntInput";
import RntSelect from "@/components/common/rntSelect";
import { HostCarInfo } from "@/model/HostCarInfo";
import Image from "next/image";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import RntPlaceAutocomplete from "@/components/common/rntPlaceAutocomplete";

type Props = {
  carInfoFormParams: HostCarInfo;
  setCarInfoFormParams: Dispatch<SetStateAction<HostCarInfo>>;
  onImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isNewCar: boolean;
};

export default function CarEditForm({ carInfoFormParams, setCarInfoFormParams, onImageFileChange, isNewCar }: Props) {
  const [autocomplete, setAutocomplete] = useState("");

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
          <strong>Location of vehicle availability</strong>
        </div>
        <div className="flex flex-wrap gap-4">
          <RntPlaceAutocomplete
            className="lg:w-full"
            id="address"
            label="Address"
            placeholder="Miami"
            initValue={autocomplete}
            includeStreetAddress={true}
            onChange={(e) => setAutocomplete(e.target.value)}
            onAddressChange={(placeDetails) => {
              const country = placeDetails.country?.short_name ?? "";
              const state = placeDetails.state?.long_name ?? "";
              const city = placeDetails.city?.long_name ?? "";
              const latitude = Math.round(placeDetails.location.latitude * 1_000_000) / 1_000_000;
              const longitude = Math.round(placeDetails.location.longitude * 1_000_000) / 1_000_000;

              setCarInfoFormParams({
                ...carInfoFormParams,
                country: country,
                state: state,
                city: city,
                locationLatitude: latitude.toString(),
                locationLongitude: longitude.toString(),
              });
            }}
          />
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
          <RntSelect
            className="w-[48%] lg:w-40"
            id="fuelType"
            label="Fuel type"
            readOnly={!isNewCar}
            value={carInfoFormParams.fuelType}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                fuelType: e.target.value,
              })
            }
          >
            <option className="hidden" disabled></option>
            <option value="Gasoline">Gasoline</option>
            <option value="Diesel">Diesel</option>
            <option value="Bio-diesel">Bio-diesel</option>
            <option value="Electro">Electro</option>
          </RntSelect>
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
        <div className="text-lg  mb-4">
          <strong>Enabled distance</strong>
        </div>
        {/* <div className="flex flex-col lg:flex-row"> */}
        <div className="flex flex-wrap gap-4">
          <RntInput
            className="lg:w-60"
            id="milesIncludedPerDay"
            label="Number of miles per day"
            placeholder="e.g. 200"
            value={carInfoFormParams.milesIncludedPerDay}
            onChange={(e) =>
              setCarInfoFormParams({
                ...carInfoFormParams,
                milesIncludedPerDay: e.target.value,
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
          <RntSelect
            className="lg:w-60"
            id="listed"
            label="Listing status"
            value={carInfoFormParams.currentlyListed.toString()}
            onChange={(e) => {
              console.log("carInfoFormParams.currentlyListed", carInfoFormParams.currentlyListed);
              console.log("carInfoFormParams.currentlyListed.toString()", carInfoFormParams.currentlyListed.toString());
              console.log("e.target.value", e.target.value);
              console.log("Boolean(e.target.value)", Boolean(e.target.value));
              console.log("e.target.value === 'true'", e.target.value === "true");
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
