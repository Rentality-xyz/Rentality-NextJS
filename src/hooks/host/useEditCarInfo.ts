import { Contract, BrowserProvider } from "ethers";
import { useEffect, useState } from "react";
import { rentalityJSON } from "../../abis";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { ContractCarInfo } from "@/model/blockchain/ContractCarInfo";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { HostCarInfo } from "@/model/HostCarInfo";

const useEditCarInfo = (carId: number) => {
  const emptyHostCarInfo = {
    carId: -1,
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

  const [dataFetched, setDataFetched] = useState<Boolean>(false);
  const [carInfoFormParams, setCarInfoFormParams] =
    useState<HostCarInfo>(emptyHostCarInfo);
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

  const getSignerAddress = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error("Ethereum wallet is not found");
      }

      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      return signer.address;
    } catch (e) {
      console.error("getSignerAddress error:" + e);
    }
  };

  const getCarInfo = async (rentalityContract: IRentalityContract) => {
    try {
      if (rentalityContract == null) {
        console.error("getMyListings error: contract is null");
        return;
      }
      const carInfo: ContractCarInfo = await rentalityContract.getCarInfoById(
        BigInt(carId)
      );
      const signerAddress = await getSignerAddress();
      if (carInfo.createdBy !== signerAddress) {
        return emptyHostCarInfo;
      }

      const tokenURI = await rentalityContract.getCarMetadataURI(carInfo.carId);
      const meta = await getMetaDataFromIpfs(tokenURI);

      const price = Number(carInfo.pricePerDayInUsdCents) / 100;
      const securityDeposit =
        Number(carInfo.securityDepositPerTripInUsdCents) / 100;
      const fuelPricePerGal = Number(carInfo.fuelPricePerGalInUsdCents) / 100;

      let item: HostCarInfo = {
        carId: Number(carInfo.carId),
        ownerAddress: carInfo.createdBy.toString(),
        image: getIpfsURIfromPinata(meta.image),
        vinNumber: carInfo.carVinNumber,
        brand: carInfo.brand,
        model: carInfo.model,
        releaseYear: Number(carInfo.yearOfProduction).toString(),
        name: meta.name ?? "",
        licensePlate:
          meta.attributes?.find((x: any) => x.trait_type === "License plate")
            ?.value ?? "",
        licenseState:
          meta.attributes?.find((x: any) => x.trait_type === "License state")
            ?.value ?? "",
        seatsNumber:
          meta.attributes?.find((x: any) => x.trait_type === "Seats number")
            ?.value ?? "",
        doorsNumber:
          meta.attributes?.find((x: any) => x.trait_type === "Doors number")
            ?.value ?? "",
        fuelType:
          meta.attributes?.find((x: any) => x.trait_type === "Fuel type")
            ?.value ?? "",
        tankVolumeInGal:
          meta.attributes?.find((x: any) => x.trait_type === "Tank volume(gal)")
            ?.value ?? "",
        wheelDrive:
          meta.attributes?.find((x: any) => x.trait_type === "Wheel drive")
            ?.value ?? "",
        transmission:
          meta.attributes?.find((x: any) => x.trait_type === "Transmission")
            ?.value ?? "",
        trunkSize:
          meta.attributes?.find((x: any) => x.trait_type === "Trunk size")
            ?.value ?? "",
        color:
          meta.attributes?.find((x: any) => x.trait_type === "Color")?.value ??
          "",
        bodyType:
          meta.attributes?.find((x: any) => x.trait_type === "Body type")
            ?.value ?? "",
        description: meta.description ?? "",
        pricePerDay: price.toString(),
        milesIncludedPerDay: carInfo.milesIncludedPerDay.toString(),
        securityDeposit: securityDeposit.toString(),
        fuelPricePerGal: fuelPricePerGal.toString(),
        country: carInfo.country,
        state: carInfo.state,
        city: carInfo.city,
        locationLatitude: (
          Number(carInfo.locationLatitudeInPPM) / 1_000_000
        ).toString(),
        locationLongitude: (
          Number(carInfo.locationLongitudeInPPM) / 1_000_000
        ).toString(),
      };
      return item;
    } catch (e) {
      console.error("getCarInfo error:" + e);
    }
  };

  const saveCar = async () => {
    try {
      setDataSaved(false);

      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("saveCar error: contract is null");
        setDataSaved(true);
        return false;
      }

      var pricePerDayDouble = Number(
        carInfoFormParams.pricePerDay.replace(/[^0-9.]+/g, "")
      );
      const pricePerDayInUsdCents = BigInt((pricePerDayDouble * 100) | 0);

      var securityDepositPerTripDouble = Number(
        carInfoFormParams.securityDeposit.replace(/[^0-9.]+/g, "")
      );
      const securityDepositPerTripInUsdCents = BigInt(
        (securityDepositPerTripDouble * 100) | 0
      );

      var fuelPricePerGalDouble = Number(
        carInfoFormParams.fuelPricePerGal.replace(/[^0-9.]+/g, "")
      );
      const fuelPricePerGalInUsdCents = BigInt(
        (fuelPricePerGalDouble * 100) | 0
      );

      var locationLatitudeDouble = Number(
        carInfoFormParams.locationLatitude.replace(/[^0-9.]+/g, "")
      );
      const locationLatitudeInPPM = BigInt(
        (locationLatitudeDouble * 1_000_000) | 0
      );
      var locationLongitudeDouble = Number(
        carInfoFormParams.locationLongitude.replace(/[^0-9.]+/g, "")
      );
      const locationLongitudeInPPM = BigInt(
        (locationLongitudeDouble * 1_000_000) | 0
      );

      let transaction = await rentalityContract.updateCarInfo(
        BigInt(carId),
        pricePerDayInUsdCents,
        securityDepositPerTripInUsdCents,
        fuelPricePerGalInUsdCents,
        BigInt(carInfoFormParams.milesIncludedPerDay),
        carInfoFormParams.country,
        carInfoFormParams.state,
        carInfoFormParams.city,
        locationLatitudeInPPM,
        locationLongitudeInPPM,
        true
      );

      const result = await transaction.wait();
      setDataSaved(true);
      return true;
    } catch (e) {
      console.error("Upload error" + e);
      setDataSaved(true);
      return false;
    }
  };

  useEffect(() => {
    if (isNaN(carId) || carId == -1) return;

    getRentalityContract()
      .then((contract) => {
        if (contract !== undefined) {
          return getCarInfo(contract);
        }
      })
      .then((data) => {
        setCarInfoFormParams(data ?? emptyHostCarInfo);
        setDataFetched(true);
      })
      .catch(() => setDataFetched(true));
  }, [carId]);

  return [
    dataFetched,
    carInfoFormParams,
    setCarInfoFormParams,
    dataSaved,
    saveCar,
  ] as const;
};

export default useEditCarInfo;
