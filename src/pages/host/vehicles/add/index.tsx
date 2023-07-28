import HostLayout from "@/components/host/layout/hostLayout";
import useAddCar, { NewCarInfo } from "@/hooks/host/useAddCar";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import PageTitle from "@/components/pageTitle/pageTitle";
import RntInput from "@/components/common/rntInput";
import RntSelect from "@/components/common/rntSelect";
import RntButton from "@/components/common/rntButton";

export default function AddCar() {
  const [
    carInfoFormParams,
    setCarInfoFormParams,
    verifyCar,
    dataSaved,
    sentCarToServer,
  ] = useAddCar();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [carSaving, setCarSaving] = useState<boolean>(false);
  const [isButtonSaveDisabled, setIsButtonSaveDisabled] = useState<boolean>(false);
  const uploadImageRef = useRef<HTMLImageElement>(null);
  const router = useRouter();

  const resizeImageToSquare = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const size = 1000;
        canvas.width = size;
        canvas.height = size;
        ctx.fillStyle = "transparent";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const scaleFactor = size / Math.max(img.width, img.height);
        const scaledWidth = img.width * scaleFactor;
        const scaledHeight = img.height * scaleFactor;
        ctx.drawImage(
          img,
          (size - scaledWidth) / 2,
          (size - scaledHeight) / 2,
          scaledWidth,
          scaledHeight
        );
        canvas.toBlob(
          (blob) => {
            const resizedFile = new File([blob as BlobPart], file.name, {
              type: "image/png",
            });
            resolve(resizedFile);
          },
          "image/png",
          1
        );
      };

      img.onerror = reject;
    });
  };

  const onChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) {
      return;
    }

    const file = e.target.files[0];
    const resizedImage = await resizeImageToSquare(file);
    setImageFile(resizedImage);

    var reader = new FileReader();

    reader.onload = function (event) {
      if (uploadImageRef.current) {
        uploadImageRef.current.src = event.target?.result?.toString() ?? "";
      }
    };

    reader.readAsDataURL(resizedImage);
  };

  const saveCar = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Image is not upoaded");
      return;
    }

    setCarSaving(true);

    try {
      setMessage("Please wait.. uploading (upto 5 mins)");
      const result = await sentCarToServer(imageFile);

      if (!result) {
        throw new Error("sentCarToServer error");
      }
      alert("Successfully listed your car!");

      setCarSaving(false);
      setMessage("");
      router.push("/host/vehicles");
    } catch (e) {
      alert("Upload error" + e);

      setCarSaving(false);
      setMessage("");
    }
  };

  useEffect(() => {
    setIsButtonSaveDisabled(imageFile == null || !verifyCar() || carSaving);
  }, [imageFile, carInfoFormParams.pricePerDay, verifyCar, carSaving]);

  // !isEmpty(carInfoFormParams.securityDeposit)&&
  // !isEmpty(carInfoFormParams.fuelPricePerGal)&&

  return (
    <HostLayout>
      <div className="add-car flex flex-col px-8 pt-4">
        <PageTitle title="Add a car" />
        <div className="add-car-block mt-4">
          <div className="text-lg mb-4">
            <strong>Car</strong>
          </div>
          <div className="flex flex-wrap gap-4">
            <RntInput 
              className="lg:w-60"
              id="vinNumber"
              label="VIN number"
              placeholder="e.g. 4Y1SL65848Z411439"
              value={carInfoFormParams.vinNumber}
              onChange={(e) => setCarInfoFormParams({
                ...carInfoFormParams,
                vinNumber: e.target.value,
              })}
            />
            <RntInput
              className="lg:w-60"
              id="brand"
              label="Brand"
              placeholder="e.g. Shelby"
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

        <div className="add-car-block mt-4">
          <div className="text-lg mb-4">
            <strong>Photo</strong>
          </div>
          <label className="flex w-40 h-16 bg-violet-700 disabled:bg-gray-500 rounded-md justify-center items-center cursor-pointer">
            <input className="hidden" type="file" onChange={onChangeFile} />
            Upload
          </label>
          <div className="w-80 h-80 rounded-2xl mt-8 bg-gray-200 bg-opacity-40">
            <img ref={uploadImageRef} />
          </div>
        </div>

        <div className="add-car-block mt-4">
          <div className="text-lg mb-4">
            <strong>Location of vehicle availability</strong>
          </div>
          <div className="flex flex-wrap gap-4">
            <RntInput
              className="lg:w-60"
              id="country"
              label="Country"
              placeholder="USA"
              value={carInfoFormParams.country}
              onChange={(e) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  country: e.target.value,
                })
              }
            />
            <RntInput
              className="lg:w-60"
              id="state"
              label="State"
              placeholder="e.g. Florida"
              value={carInfoFormParams.state}
              onChange={(e) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  state: e.target.value,
                })
              }
            />
            <RntInput
              className="lg:w-60"
              id="city"
              label="City"
              placeholder="e.g. Miami"
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

        <div className="add-car-block mt-4">
          <div className="text-lg mb-4">
            <strong>Car Basics</strong>
          </div>
          <div className="flex flex-wrap gap-4">
            <RntInput
              className="lg:w-60"
              id="name"
              label="Car name"
              placeholder="e.g. Eleanor"
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
              id="state"
              label="State"
              placeholder="e.g. Florida"
              value={carInfoFormParams.state}
              onChange={(e) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  state: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="add-car-block mt-4">
          <div className="text-lg  mb-4">
            <strong>Basic car details</strong>
          </div>
          <div className="details flex flex-wrap gap-4">
            <RntInput
              className="w-[48%] lg:w-40"
              id="seatsNumber"
              label="Number of seats"
              placeholder="e.g. 5"
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
              value={carInfoFormParams.fuelType}
              onChange={(e) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  fuelType: e.target.value,
                })
              }>
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
              value={carInfoFormParams.transmission}
              onChange={(e) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  transmission: e.target.value,
                })
              }>
              <option className="hidden" disabled></option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </RntSelect>
            <RntInput
              className="w-[48%] lg:w-40"
              id="color"
              label="Color"
              placeholder="e.g. Green"
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
        <div className="add-car-block mt-4">
          <div className="text-lg  mb-4">
            <strong>More about the car</strong>
          </div>
          <div className="flex flex-col">
            <textarea
              className="w-full px-4 py-2 rounded-2xl"
              rows={5}
              id="description"
              placeholder="e.g. Dupont Pepper Grey 1967 Ford Mustang fastback"
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
        
        <div className="add-car-block mt-4">
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

        <div className="add-car-block mt-4">
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
          </div>
        </div>
        <div className="mb-8 mt-8">
          <RntButton className="w-40 h-16" disabled={isButtonSaveDisabled} onClick={saveCar}>
            Save
          </RntButton>
          <label>{message}</label>
        </div>
      </div>
    </HostLayout>
  );
}
