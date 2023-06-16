import HostLayout from "@/components/host/layout/hostLayout";
import useAddCar, { NewCarInfo } from "@/hooks/host/useAddCar";
import { uploadFileToIPFS } from "@/utils/pinata";
import { verify } from "crypto";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import PageTitle from "@/components/pageTitle/pageTitle";

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

  return (
    <HostLayout>
      <div className="add-car flex flex-col px-8 pt-4">
        <PageTitle title="Add a car"/>
        <div className="add-car-block">
          <div className="text-lg mb-4">
            <strong>Car</strong>
          </div>
          <div className="flex flex-wrap gap-4">
            {/* <div className="w-full grid grid-rows-1 grid-flow-row auto-rows-min"> */}
            <div className="flex flex-col w-full lg:w-min">
              <label htmlFor="vinNumber">VIN number</label>
              <input
                id="vinNumber"
                type="text"
                placeholder="e.g. 4Y1SL65848Z411439"
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    vinNumber: e.target.value,
                  })
                }
                value={carInfoFormParams.vinNumber}
              />
            </div>
            <div className="flex flex-col w-full lg:w-min">
              <label htmlFor="brand">Brand</label>
              <input
                id="brand"
                type="text"
                placeholder="e.g. Shelby"
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    brand: e.target.value,
                  })
                }
                value={carInfoFormParams.brand}
              />
            </div>
            <div className="flex flex-col w-full lg:w-min">
              <label htmlFor="model">Model</label>
              <input
                id="model"
                type="text"
                placeholder="e.g. Mustang GT500"
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    model: e.target.value,
                  })
                }
                value={carInfoFormParams.model}
              />
            </div>
            <div className="flex flex-col w-full lg:w-min">
              <label htmlFor="releaseYear">Year of manufacture</label>
              <input
                id="releaseYear"
                type="text"
                placeholder="e.g. 2023"
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    releaseYear: e.target.value,
                  })
                }
                value={carInfoFormParams.releaseYear}
              />
            </div>
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
            <div className="flex flex-col">
              <label htmlFor="name">Car name</label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Eleanor"
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    name: e.target.value,
                  })
                }
                value={carInfoFormParams.name}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="licensePlate">License plate number</label>
              <input
                id="licensePlate"
                type="text"
                placeholder="e.g. ABC-12D"
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    licensePlate: e.target.value,
                  })
                }
                value={carInfoFormParams.licensePlate}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="state">State</label>
              <input
                id="state"
                type="text"
                placeholder="e.g. New Jersey"
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    state: e.target.value,
                  })
                }
                value={carInfoFormParams.state}
              />
            </div>
          </div>
        </div>
        <div className="add-car-block">
          <div className="text-lg  mb-4">
            <strong>Basic car details</strong>
          </div>
          {/* <div className="flex flex-col lg:flex-row"> */}
          <div className="details flex flex-wrap gap-4">
            <div className="flex flex-col w-2/5 lg:w-min">
              <label htmlFor="seatsNumber">Number of seats</label>
              <input
                id="seatsNumber"
                type="text"
                placeholder="e.g. 5"
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    seatsNumber: e.target.value,
                  })
                }
                value={carInfoFormParams.seatsNumber}
              />
            </div>
            <div className="flex flex-col w-1/2 lg:w-min">
              <label htmlFor="doorsNumber">Number of doors</label>
              <input
                id="doorsNumber"
                type="text"
                placeholder="e.g. 2"
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    doorsNumber: e.target.value,
                  })
                }
                value={carInfoFormParams.doorsNumber}
              />
            </div>
            <div className="flex flex-col w-full lg:w-min">
              <label htmlFor="fuelType">Fuel type</label>
              <select
                id="fuelType"
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    fuelType: e.target.value,
                  })
                }
                defaultValue = {""}
                value={carInfoFormParams.fuelType}
              >
                <option className="hidden" disabled></option>
                <option value="Gasoline">Gasoline</option>
                <option value="Diesel">Diesel</option>
                <option value="Bio-diesel">Bio-diesel</option>
                <option value="Electro">Electro</option>
              </select>
            </div>
            <div className="flex flex-col w-full lg:w-min">
              <label htmlFor="tankVolumeInGal">Tank size</label>
              <input
                id="tankVolumeInGal"
                type="text"
                placeholder="e.g. 16"
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    tankVolumeInGal: e.target.value,
                  })
                }
                value={carInfoFormParams.tankVolumeInGal}
              />
            </div>
            <div className="flex flex-col w-full lg:w-min">
              <label htmlFor="transmission">Transmission</label>
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
            <div className="flex flex-col w-full lg:w-min">
              <label htmlFor="color">Color</label>
              <input
                id="color"
                type="text"
                placeholder="e.g. Grey"
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    color: e.target.value,
                  })
                }
                value={carInfoFormParams.color}
              />
            </div>
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
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col">
              <div className="text-lg mb-4">
                <strong>Price</strong>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-col">
                  <label htmlFor="pricePerDay">Rental price</label>
                  <input
                    id="pricePerDay"
                    type="text"
                    placeholder="e.g. 100"
                    step="1"
                    onChange={(e) =>
                      setCarInfoFormParams({
                        ...carInfoFormParams,
                        pricePerDay: e.target.value,
                      })
                    }
                    value={carInfoFormParams.pricePerDay}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-lg  mb-4">
                <strong>Enabled distance</strong>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-col">
                  <label htmlFor="distanceIncludedInMi">
                    Number of miles per day
                  </label>
                  <input
                    id="distanceIncludedInMi"
                    type="text"
                    placeholder="e.g. 200"
                    onChange={(e) =>
                      setCarInfoFormParams({
                        ...carInfoFormParams,
                        distanceIncludedInMi: e.target.value,
                      })
                    }
                    value={carInfoFormParams.distanceIncludedInMi}
                  />
                </div>
              </div>
            </div>
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
