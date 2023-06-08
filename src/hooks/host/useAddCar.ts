import { Contract, BrowserProvider } from "ethers";
import { useState } from "react";
import { rentalityJSON } from "../../abis";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../../utils/pinata";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";

export type NewCarInfo = {
  vinNumber: string;
  brand: string;
  model: string;
  releaseYear: string;
  image: string;
  name: string;
  licensePlate: string;
  state: string;
  seatsNumber: string;
  doorsNumber: string;
  fuelType: string;
  tankVolumeInGal: string;
  wheelDrive: string;
  transmission: string;
  trunkSize: string;
  color: string;
  bodyType: string;
  description: string;
  pricePerDay: string;
  distanceIncludedInMi: string;
};

const useAddCar = () => {
  const emptyNewCarInfo = {
    vinNumber: "",
    brand: "",
    model: "",
    releaseYear: "",
    image: "",
    name: "",
    licensePlate: "",
    state: "",
    seatsNumber: "",
    doorsNumber: "",
    fuelType: "",
    tankVolumeInGal: "",
    wheelDrive: "",
    transmission: "",
    trunkSize: "",
    color: "",
    bodyType: "",
    description: "",
    pricePerDay: "",
    distanceIncludedInMi: "",
  };

  const [carInfoFormParams, setCarInfoFormParams] =
    useState<NewCarInfo>(emptyNewCarInfo);
  const [dataSaved, setDataSaved] = useState<Boolean>(false);

  const getRentalityContract = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error("Ethereum wallet is not found");
      }

      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      return new Contract(
        rentalityJSON.address,
        rentalityJSON.abi,
        signer
      ) as unknown as IRentalityContract;
    } catch (e) {
      console.error("getRentalityContract error:" + e);
    }
  };

  const uploadMetadataToIPFS = async ({
    vinNumber,
    brand,
    model,
    releaseYear,
    image,
    name,
    licensePlate,
    state,
    seatsNumber,
    doorsNumber,
    fuelType,
    tankVolumeInGal,
    wheelDrive,
    transmission,
    trunkSize,
    color,
    bodyType,
    description,
    pricePerDay,
    distanceIncludedInMi,
  }: NewCarInfo) => {
    if (!verifyCar()) {
      return;
    }

    const attributes = [
      {
        trait_type: "VIN number",
        value: vinNumber,
      },
      {
        trait_type: "License plate",
        value: licensePlate,
      },
      {
        trait_type: "State",
        value: state,
      },
      {
        trait_type: "Brand",
        value: brand,
      },
      {
        trait_type: "Model",
        value: model,
      },
      {
        trait_type: "Release year",
        value: releaseYear,
      },
      {
        trait_type: "Body type",
        value: bodyType,
      },
      {
        trait_type: "Color",
        value: color,
      },
      {
        trait_type: "Doors number",
        value: doorsNumber,
      },
      {
        trait_type: "Seats number",
        value: seatsNumber,
      },
      {
        trait_type: "Trunk size",
        value: trunkSize,
      },
      {
        trait_type: "Transmission",
        value: transmission,
      },
      {
        trait_type: "Wheel drive",
        value: wheelDrive,
      },
      {
        trait_type: "Fuel type",
        value: fuelType,
      },
      {
        trait_type: "Tank volume(gal)",
        value: tankVolumeInGal,
      },
      {
        trait_type: "Distance included(mi)",
        value: distanceIncludedInMi,
      },
      {
        trait_type: "Price per Day (USD cents)",
        value: pricePerDay,
      },
    ];
    const nftJSON = {
      name,
      description,
      image,
      attributes,
    };

    try {
      //upload the metadata JSON to IPFS
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        return response.pinataURL;
      }
    } catch (e) {
      console.log("error uploading JSON metadata:", e);
      alert("error uploading JSON metadata: " + e);
    }
  };

  const isEmpty = (str: string) => {
    return !str || str.length === 0;
  };

  const verifyCar = () => {
    return (
      !isEmpty(carInfoFormParams.vinNumber) &&
      !isEmpty(carInfoFormParams.brand) &&
      !isEmpty(carInfoFormParams.model) &&
      !isEmpty(carInfoFormParams.releaseYear) &&
      !isEmpty(carInfoFormParams.name) &&
      !isEmpty(carInfoFormParams.licensePlate) &&
      !isEmpty(carInfoFormParams.state) &&
      !isEmpty(carInfoFormParams.seatsNumber) &&
      !isEmpty(carInfoFormParams.doorsNumber) &&
      !isEmpty(carInfoFormParams.fuelType) &&
      !isEmpty(carInfoFormParams.tankVolumeInGal) &&
      //!carInfoFormParams.wheelDrive &&
      !isEmpty(carInfoFormParams.transmission) &&
      //!carInfoFormParams.trunkSize &&
      !isEmpty(carInfoFormParams.color) &&
      //!isEmpty(carInfoFormParams.bodyType) &&
      !isEmpty(carInfoFormParams.description) &&
      !isEmpty(carInfoFormParams.pricePerDay) &&
      !isEmpty(carInfoFormParams.distanceIncludedInMi)
    );
  };

  const saveCar = async (image: File) => {
    try {
      const response = await uploadFileToIPFS(image);

      if (response.success !== true) {
        console.error("Uploaded image to Pinata error");
        return false;
      }

      console.log("Uploaded image to Pinata: ", response.pinataURL);
      const dataToSave = {
        ...carInfoFormParams,
        image: response.pinataURL,
      };
      setCarInfoFormParams(dataToSave);

      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("saveCar error: contract is null");
        return false;
      }
      const metadataURL = await uploadMetadataToIPFS(dataToSave);

      var doubleNumber = Number(
        dataToSave.pricePerDay.replace(/[^0-9.]+/g, "")
      );
      const pricePerDay = BigInt((doubleNumber * 100) | 0);
      const tankVolumeInGal = BigInt(carInfoFormParams.tankVolumeInGal);
      const distanceIncludedInMi = BigInt(
        carInfoFormParams.distanceIncludedInMi
      );

      let transaction = await rentalityContract.addCar(
        metadataURL,
        carInfoFormParams.vinNumber,
        pricePerDay,
        tankVolumeInGal,
        distanceIncludedInMi
      );

      const result = await transaction.wait();
      console.log("result: " + JSON.stringify(result));
      setCarInfoFormParams(emptyNewCarInfo);
      setDataSaved(true);
      return true;
    } catch (e) {
      alert("Upload error" + e);
      return false;
    }
  };

  return [
    carInfoFormParams,
    setCarInfoFormParams,
    verifyCar,
    dataSaved,
    saveCar,
  ] as const;
};

export default useAddCar;
