import HostLayout from "@/components/host/layout/hostLayout";
import useAddCar, { NewCarInfo } from "@/hooks/host/useAddCar";
import { uploadFileToIPFS } from "@/utils/pinata";
import { verify } from "crypto";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import PageTitle from "@/components/pageTitle/pageTitle";
import InputBlock from "@/components/inputBlock";

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
  const saveButtonRef = useRef<HTMLButtonElement>(null);
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

    try {
      setMessage("Please wait.. uploading (upto 5 mins)");
      if (saveButtonRef.current) {
        saveButtonRef.current.disabled = true;
      }
      const result = await sentCarToServer(imageFile);

      if (!result) {
        throw new Error("sentCarToServer error");
      }
      alert("Successfully listed your car!");
      setMessage("");
      router.push("/host/vehicles");
    } catch (e) {
      alert("Upload error" + e);
      if (saveButtonRef.current) {
        saveButtonRef.current.disabled = false;
      }
    }
  };

  useEffect(() => {
    if (saveButtonRef.current) {
      saveButtonRef.current.disabled = imageFile == null || !verifyCar();
    }
  }, [imageFile, carInfoFormParams.pricePerDay, verifyCar]);

  // !isEmpty(carInfoFormParams.securityDeposit)&&
  // !isEmpty(carInfoFormParams.fuelPricePerGal)&&

  return (
    <HostLayout>
      <div className="add-car flex flex-col px-8 pt-4">
        <PageTitle title="Add a car" />
        <div className="add-car-block">
          <div className="text-lg mb-4">
            <strong>Car</strong>
          </div>
          <div className="flex flex-wrap gap-4">
            <InputBlock
              className="lg:w-min"
              id="vinNumber"
              label="VIN number"
              placeholder="e.g. 4Y1SL65848Z411439"
              value={carInfoFormParams.vinNumber}
              setValue={(newValue) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  vinNumber: newValue,
                })
              }
            />
            <InputBlock
              className="lg:w-min"
              id="brand"
              label="Brand"
              placeholder="e.g. Shelby"
              value={carInfoFormParams.brand}
              setValue={(newValue) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  brand: newValue,
                })
              }
            />
            <InputBlock
              className="lg:w-min"
              id="model"
              label="Model"
              placeholder="e.g. Mustang GT500"
              value={carInfoFormParams.model}
              setValue={(newValue) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  model: newValue,
                })
              }
            />
            <InputBlock
              className="lg:w-min"
              id="releaseYear"
              label="Year of manufacture"
              placeholder="e.g. 2023"
              value={carInfoFormParams.releaseYear}
              setValue={(newValue) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  releaseYear: newValue,
                })
              }
            />
          </div>
        </div>

        <div className="add-car-block">
          <div className="text-lg mb-4">
            <strong>Photo</strong>
          </div>
          {/* <button className="w-40 h-16 bg-violet-700 rounded-md">Upload</button> */}
          <label className="flex w-40 h-16 bg-violet-700 rounded-md justify-center items-center cursor-pointer">
            <input className="hidden" type="file" onChange={onChangeFile} />
            Upload
          </label>
          <div className="w-80 h-80 rounded-2xl mt-8 bg-gray-200 bg-opacity-40">
            <img ref={uploadImageRef} />
          </div>
        </div>

        <div className="add-car-block">
          <div className="text-lg mb-4">
            <strong>Car Basics</strong>
          </div>
          <div className="flex flex-wrap gap-4">
            <InputBlock
              className="lg:w-min"
              id="name"
              label="Car name"
              placeholder="e.g. Eleanor"
              value={carInfoFormParams.name}
              setValue={(newValue) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  name: newValue,
                })
              }
            />
            <InputBlock
              className="lg:w-min"
              id="licensePlate"
              label="License plate number"
              placeholder="e.g. ABC-12D"
              value={carInfoFormParams.licensePlate}
              setValue={(newValue) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  licensePlate: newValue,
                })
              }
            />
            <InputBlock
              className="lg:w-min"
              id="country"
              label="Country"
              placeholder="USA"
              value={carInfoFormParams.country}
              setValue={(newValue) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  country: newValue,
                })
              }
            />
            <InputBlock
              className="lg:w-min"
              id="state"
              label="State"
              placeholder="e.g. Florida"
              value={carInfoFormParams.state}
              setValue={(newValue) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  state: newValue,
                })
              }
            />
            <InputBlock
              className="lg:w-min"
              id="city"
              label="City"
              placeholder="e.g. Miami"
              value={carInfoFormParams.city}
              setValue={(newValue) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  city: newValue,
                })
              }
            />
            <InputBlock
              className="lg:w-min"
              id="locationLatitude"
              label="Car location latitude"
              placeholder="e.g. 42.12345"
              value={carInfoFormParams.locationLatitude}
              setValue={(newValue) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  locationLatitude: newValue,
                })
              }
            />
            <InputBlock
              className="lg:w-min"
              id="locationLongitude"
              label="Car location longitude"
              placeholder="e.g. 42.12345"
              value={carInfoFormParams.locationLongitude}
              setValue={(newValue) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  locationLongitude: newValue,
                })
              }
            />
          </div>
        </div>
        <div className="add-car-block">
          <div className="text-lg  mb-4">
            <strong>Basic car details</strong>
          </div>
          {/* <div className="flex flex-col lg:flex-row"> */}
          <div className="details flex flex-wrap gap-4">
            <InputBlock
              className="w-2/5 lg:w-min"
              id="seatsNumber"
              label="Number of seats"
              placeholder="e.g. 5"
              value={carInfoFormParams.seatsNumber}
              setValue={(newValue) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  seatsNumber: newValue,
                })
              }
            />
            <InputBlock
              className="w-1/2 lg:w-min"
              id="doorsNumber"
              label="Number of doors"
              placeholder="e.g. 2"
              value={carInfoFormParams.doorsNumber}
              setValue={(newValue) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  doorsNumber: newValue,
                })
              }
            />
            <div className="flex flex-col w-full lg:w-min">
              <label className="mb-1" htmlFor="fuelType">
                Fuel type
              </label>
              <select
                id="fuelType"
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    fuelType: e.target.value,
                  })
                }
                defaultValue={""}
                value={carInfoFormParams.fuelType}
              >
                <option className="hidden" disabled></option>
                <option value="Gasoline">Gasoline</option>
                <option value="Diesel">Diesel</option>
                <option value="Bio-diesel">Bio-diesel</option>
                <option value="Electro">Electro</option>
              </select>
            </div>
            <InputBlock
              className="w-full lg:w-min"
              id="tankVolumeInGal"
              label="Tank size in gal"
              placeholder="e.g. 16"
              value={carInfoFormParams.tankVolumeInGal}
              setValue={(newValue) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  tankVolumeInGal: newValue,
                })
              }
            />
            <div className="flex flex-col w-full lg:w-min">
              <label className="mb-1" htmlFor="transmission">
                Transmission
              </label>
              <select
                id="transmission"
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    transmission: e.target.value,
                  })
                }
                value={carInfoFormParams.transmission}
              >
                <option className="hidden" disabled selected></option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>
            <InputBlock
              className="w-full lg:w-min"
              id="color"
              label="Color"
              placeholder="e.g. 16"
              value={carInfoFormParams.color}
              setValue={(newValue) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  color: newValue,
                })
              }
            />
          </div>
        </div>
        <div className="add-car-block">
          <div className="text-lg  mb-4">
            <strong>More about the car</strong>
          </div>
          <div className="flex flex-col">
            <textarea
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
        
        <div className="add-car-block">
          <div className="text-lg  mb-4">
            <strong>Enabled distance</strong>
          </div>
          {/* <div className="flex flex-col lg:flex-row"> */}
          <div className="flex flex-wrap gap-4">
            <InputBlock
              className="lg:w-min"
              id="milesIncludedPerDay"
              label="Number of miles per day"
              placeholder="e.g. 200"
              value={carInfoFormParams.milesIncludedPerDay}
              setValue={(newValue) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  milesIncludedPerDay: newValue,
                })
              }
            />
          </div>
        </div>

        <div className="add-car-block">
          <div className="text-lg  mb-4">
            <strong>Price</strong>
          </div>
          {/* <div className="flex flex-col lg:flex-row"> */}
          <div className="flex flex-wrap gap-4">
            <InputBlock
              className="lg:w-min"
              id="pricePerDay"
              label="Rental price"
              placeholder="e.g. 100"
              value={carInfoFormParams.pricePerDay}
              setValue={(newValue) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  pricePerDay: newValue,
                })
              }
            />
            <InputBlock
              className="lg:w-min"
              id="securityDeposit"
              label="Security deposit"
              placeholder="e.g. 300"
              value={carInfoFormParams.securityDeposit}
              setValue={(newValue) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  securityDeposit: newValue,
                })
              }
            />
            <InputBlock
              className="lg:w-min"
              id="fuelPricePerGal"
              label="Fuel price per gal"
              placeholder="e.g. 5.00"
              value={carInfoFormParams.fuelPricePerGal}
              setValue={(newValue) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  fuelPricePerGal: newValue,
                })
              }
            />
          </div>
        </div>
        <div className="add-car-block mb-8 mt-8">
          <label>{message}</label>
          <button
            className="w-40 h-16 bg-violet-700 disabled:bg-gray-500 rounded-md"
            ref={saveButtonRef}
            onClick={saveCar}
          >
            Save
          </button>
        </div>
      </div>
    </HostLayout>
  );
}
