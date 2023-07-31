import { Contract, BrowserProvider } from "ethers";
import { useState } from "react";
import { rentalityJSON } from "../../abis";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../../utils/pinata";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { ContractCreateCarRequest } from "@/model/blockchain/ContractCreateCarRequest";
import { HostCarInfo } from "@/model/HostCarInfo";

const useAddCar = () => {
  const emptyNewCarInfo = {
    carId: 0,
    ownerAddress: "",
    vinNumber: "",
    brand: "",
    model: "",
    releaseYear: "",
    image: "",
    name: "",
    licensePlate: "",
    licenseState: "",
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
    milesIncludedPerDay: "",
    securityDeposit: "",
    fuelPricePerGal: "",
    country: "",
    state: "",
    city: "",
    locationLatitude: "",
    locationLongitude: "",
  };

  const [carInfoFormParams, setCarInfoFormParams] =
    useState<HostCarInfo>(emptyNewCarInfo);
  const [dataSaved, setDataSaved] = useState<Boolean>(true);

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
    licenseState,
    seatsNumber,
    doorsNumber,
    fuelType,
    tankVolumeInGal,
    wheelDrive,
    transmission,
    trunkSize,
    color,
    bodyType,
    description
  }: HostCarInfo) => {
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
        trait_type: "License state",
        value: licenseState,
      },
      // {
      //   trait_type: "State",
      //   value: state,
      // },
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
      // {
      //   trait_type: "Distance included(mi)",
      //   value: milesIncludedPerDay,
      // },
      // {
      //   trait_type: "Price per Day (USD cents)",
      //   value: pricePerDay,
      // }
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
      console.error("error uploading JSON metadata:", e);
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
      !isEmpty(carInfoFormParams.licenseState) &&
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
      !isEmpty(carInfoFormParams.milesIncludedPerDay)&&
      !isEmpty(carInfoFormParams.securityDeposit)&&
      !isEmpty(carInfoFormParams.fuelPricePerGal)&&
      !isEmpty(carInfoFormParams.country)&&
      !isEmpty(carInfoFormParams.state) &&
      !isEmpty(carInfoFormParams.city)&&
      !isEmpty(carInfoFormParams.locationLatitude)&&
      !isEmpty(carInfoFormParams.locationLongitude)
    );
  };

  const saveCar = async (image: File) => {
    try {      
      setDataSaved(false);
      const response = await uploadFileToIPFS(image);

      if (response.success !== true) {
        console.error("Uploaded image to Pinata error");
        
        setDataSaved(true);
        return false;
      }

      console.log("Uploaded image to Pinata: ", response.pinataURL);
      const dataToSave = {
        ...carInfoFormParams,
        image: response.pinataURL,
      };

      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("saveCar error: contract is null");
        setDataSaved(true);
        return false;
      }
      const metadataURL = await uploadMetadataToIPFS(dataToSave);

      var pricePerDayDouble = Number(dataToSave.pricePerDay.replace(/[^0-9.]+/g, ""));
      const pricePerDayInUsdCents = BigInt((pricePerDayDouble * 100) | 0);

      var securityDepositPerTripDouble = Number(dataToSave.securityDeposit.replace(/[^0-9.]+/g, ""));
      const securityDepositPerTripInUsdCents = BigInt((securityDepositPerTripDouble * 100) | 0);

      var fuelPricePerGalDouble = Number(dataToSave.fuelPricePerGal.replace(/[^0-9.]+/g, ""));
      const fuelPricePerGalInUsdCents = BigInt((fuelPricePerGalDouble * 100) | 0);

      var locationLatitudeDouble = Number(dataToSave.locationLatitude.replace(/[^0-9.]+/g, ""));
      const locationLatitudeInPPM = BigInt((locationLatitudeDouble * 1_000_000) | 0);
      var locationLongitudeDouble = Number(dataToSave.locationLongitude.replace(/[^0-9.]+/g, ""));
      const locationLongitudeInPPM = BigInt((locationLongitudeDouble * 1_000_000) | 0);

      const request: ContractCreateCarRequest = {
        tokenUri: metadataURL,
        carVinNumber: dataToSave.vinNumber,
        brand: dataToSave.brand,
        model: dataToSave.model,
        yearOfProduction: dataToSave.releaseYear,
        pricePerDayInUsdCents: pricePerDayInUsdCents,
        securityDepositPerTripInUsdCents: securityDepositPerTripInUsdCents,
        tankVolumeInGal: BigInt(dataToSave.tankVolumeInGal),
        fuelPricePerGalInUsdCents: fuelPricePerGalInUsdCents,
        milesIncludedPerDay: BigInt(dataToSave.milesIncludedPerDay),
        country: dataToSave.country,
        state: dataToSave.state,
        city: dataToSave.city,
        locationLatitudeInPPM: locationLatitudeInPPM,
        locationLongitudeInPPM: locationLongitudeInPPM,
      };

      let transaction = await rentalityContract.addCar(request);

      const result = await transaction.wait();
      setCarInfoFormParams(emptyNewCarInfo);
      setDataSaved(true);
      return true;
    } catch (e) {
      alert("Upload error" + e);
      setDataSaved(true);
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
