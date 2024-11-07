import { getEtherContractWithSigner } from "@/abis";
import { ENGINE_TYPE_PETROL_STRING, getEngineTypeString } from "@/model/EngineType";
import { getMilesIncludedPerDayText } from "@/model/HostCarInfo";
import { SearchCarInfo } from "@/model/SearchCarsResult";
import { emptyLocationInfo } from "@/model/LocationInfo";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import {
  ContractLocationInfo,
  ContractSearchCarParams,
  ContractSearchCarWithDistance,
} from "@/model/blockchain/schemas";
import { emptyContractLocationInfo, validateContractSearchCarWithDistance } from "@/model/blockchain/schemas_utils";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { getBlockchainTimeFromDate } from "@/utils/formInput";
import { getIpfsURI, getMetaDataFromIpfs, parseMetaData } from "@/utils/ipfsUtils";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { isEmpty } from "@/utils/string";
import { JsonRpcProvider, Wallet } from "ethers";
import moment from "moment";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "@/utils/env";
import { SearchCarFilters, SearchCarRequest } from "@/model/SearchCarRequest";
import { allSupportedBlockchainList } from "@/model/blockchain/blockchainList";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const privateKey = env.SIGNER_PRIVATE_KEY;
  if (isEmpty(privateKey)) {
    console.error("API checkTrips error: private key was not set");
    res.status(500).json({ error: "private key was not set" });
    return;
  }

  const {
    chainId,
    dateFrom,
    dateTo,
    country,
    state,
    city,
    latitude,
    longitude,
    brand,
    model,
    yearOfProductionFrom,
    yearOfProductionTo,
    pricePerDayInUsdFrom,
    pricePerDayInUsdTo,
    isDeliveryToGuest,
    pickupLocation,
    returnLocation,
  } = req.query;
  const chainIdNumber = Number(chainId) > 0 ? Number(chainId) : env.NEXT_PUBLIC_DEFAULT_CHAIN_ID;

  if (!chainIdNumber) {
    console.error("API checkTrips error: chainId was not provided");
    res.status(400).json({ error: "chainId was not provided" });
    return;
  }

  let providerApiUrl = process.env[`PROVIDER_API_URL_${chainIdNumber}`];
  if (!providerApiUrl) {
    console.error(`API checkTrips error: API URL for chain id ${chainIdNumber} was not set`);
    res.status(500).json({ error: `API checkTrips error: API URL for chain id ${chainIdNumber} was not set` });
    return;
  }

  const location = `${city as string}, ${state as string}, ${country as string}`;

  const timeZoneId = await getTimeZoneIdFromAddress(location);
  if (isEmpty(timeZoneId)) {
    res.status(500).json({ error: "API checkTrips error: GOOGLE_MAPS_API_KEY was not set" });
    return;
  }

  const isDeliveryToGuestValue = (isDeliveryToGuest as string)?.toLowerCase() === "true";
  const pickupLocationValues = (pickupLocation as string)?.split(";");
  const returnLocationValues = (returnLocation as string)?.split(";");

  const searchCarRequest: SearchCarRequest = {
    searchLocation: {
      address: "",
      country: country as string,
      state: state as string,
      city: "",
      latitude: Number(latitude as string),
      longitude: Number(longitude as string),
      timeZoneId: "",
    },
    dateFromInDateTimeStringFormat: dateFrom as string,
    dateToInDateTimeStringFormat: dateTo as string,
    isDeliveryToGuest: isDeliveryToGuestValue,
    deliveryInfo: {
      pickupLocation:
        !isDeliveryToGuestValue || pickupLocationValues?.length !== 2
          ? { isHostHomeLocation: true }
          : {
              isHostHomeLocation: false,
              locationInfo: {
                ...emptyLocationInfo,
                latitude: Number(pickupLocationValues[0]),
                longitude: Number(pickupLocationValues[1]),
              },
            },
      returnLocation:
        !isDeliveryToGuestValue || returnLocationValues?.length !== 2
          ? { isHostHomeLocation: true }
          : {
              isHostHomeLocation: false,
              locationInfo: {
                ...emptyLocationInfo,
                latitude: Number(returnLocationValues[0]),
                longitude: Number(returnLocationValues[1]),
              },
            },
    },
  };
  const searchCarFilters: SearchCarFilters = {
    brand: brand as SearchCarFilters["brand"],
    model: model as SearchCarFilters["model"],
    yearOfProductionFrom: yearOfProductionFrom ? Number(yearOfProductionFrom) : undefined,
    yearOfProductionTo: yearOfProductionTo ? Number(yearOfProductionTo) : undefined,
    pricePerDayInUsdFrom: pricePerDayInUsdFrom ? Number(pricePerDayInUsdFrom) : undefined,
    pricePerDayInUsdTo: pricePerDayInUsdTo ? Number(pricePerDayInUsdTo) : undefined,
  };

  console.log(
    `\nCalling searchAvailableCars API for ${chainIdNumber} chain id with searchCarRequest: ${JSON.stringify(
      searchCarRequest
    )} and searchCarFilters: ${JSON.stringify(searchCarFilters)}`
  );

  const provider = new JsonRpcProvider(providerApiUrl);
  const wallet = new Wallet(privateKey, provider);

  const rentality = (await getEtherContractWithSigner("gateway", wallet)) as unknown as IRentalityContract;

  if (rentality === null) {
    res.status(500).json({ error: "rentality is null" });
    return;
  }

  const { contractDateFromUTC, contractDateToUTC, contractSearchCarParams } = formatSearchAvailableCarsContractRequest(
    searchCarRequest,
    searchCarFilters,
    timeZoneId
  );
  let availableCarsView: ContractSearchCarWithDistance[];

  if (searchCarRequest.isDeliveryToGuest) {
    const pickUpInfo: ContractLocationInfo = {
      ...emptyContractLocationInfo,
      latitude: searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation
        ? ""
        : searchCarRequest.deliveryInfo.pickupLocation.locationInfo.latitude.toFixed(6),
      longitude: searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation
        ? ""
        : searchCarRequest.deliveryInfo.pickupLocation.locationInfo.longitude.toFixed(6),
    };
    const returnInfo: ContractLocationInfo = {
      ...emptyContractLocationInfo,
      latitude: searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation
        ? ""
        : searchCarRequest.deliveryInfo.returnLocation.locationInfo.latitude.toFixed(6),
      longitude: searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation
        ? ""
        : searchCarRequest.deliveryInfo.returnLocation.locationInfo.longitude.toFixed(6),
    };

    availableCarsView = await rentality.searchAvailableCarsWithDelivery(
      contractDateFromUTC,
      contractDateToUTC,
      contractSearchCarParams,
      pickUpInfo,
      returnInfo
    );
  } else {
    availableCarsView = await rentality.searchAvailableCars(
      contractDateFromUTC,
      contractDateToUTC,
      contractSearchCarParams
    );
  }

  const availableCarsData = await formatSearchAvailableCarsContractResponse(
    rentality,
    chainIdNumber,
    availableCarsView
  );

  res.status(200).json(availableCarsData);
}

function getTotalDiscount(pricePerDay: number, tripDays: number, totalPriceWithDiscount: number) {
  const totalDiscount = pricePerDay * tripDays - totalPriceWithDiscount;
  let result: string = "";
  if (totalDiscount > 0) {
    result = "-$" + displayMoneyWith2Digits(totalDiscount);
  } else {
    result = "-";
  }
  return result;
}

function getDaysDiscount(tripDays: number) {
  switch (true) {
    case tripDays >= 30:
      return "30+ day discount";
    case tripDays >= 7:
      return "7+ day discount";
    case tripDays >= 3:
      return "3+ day discount";
    default:
      return "Days discount";
  }
}

function formatSearchAvailableCarsContractRequest(
  searchCarRequest: SearchCarRequest,
  searchCarFilters: SearchCarFilters,
  timeZoneId: string
) {
  const startCarLocalDateTime = moment.tz(searchCarRequest.dateFromInDateTimeStringFormat, timeZoneId).toDate();
  const endCarLocalDateTime = moment.tz(searchCarRequest.dateToInDateTimeStringFormat, timeZoneId).toDate();
  const contractDateFromUTC = getBlockchainTimeFromDate(startCarLocalDateTime);
  const contractDateToUTC = getBlockchainTimeFromDate(endCarLocalDateTime);
  const contractSearchCarParams: ContractSearchCarParams = {
    country: searchCarRequest.searchLocation.country ?? "",
    state: searchCarRequest.searchLocation.state ?? "",
    city: searchCarRequest.searchLocation.city ?? "",
    brand: searchCarFilters.brand ?? "",
    model: searchCarFilters.model ?? "",
    yearOfProductionFrom: BigInt(searchCarFilters.yearOfProductionFrom ?? 0),
    yearOfProductionTo: BigInt(searchCarFilters.yearOfProductionTo ?? 0),
    pricePerDayInUsdCentsFrom: BigInt((searchCarFilters.pricePerDayInUsdFrom ?? 0) * 100),
    pricePerDayInUsdCentsTo: BigInt((searchCarFilters.pricePerDayInUsdTo ?? 0) * 100),
    userLocation: {
      ...emptyContractLocationInfo,
      latitude: searchCarRequest.searchLocation.latitude.toFixed(6),
      longitude: searchCarRequest.searchLocation.longitude.toFixed(6),
    },
  };
  return { contractDateFromUTC, contractDateToUTC, contractSearchCarParams } as const;
}

async function formatSearchAvailableCarsContractResponse(
  rentality: IRentalityContract,
  chainId: number,
  searchCarsViewsView: ContractSearchCarWithDistance[]
) {
  if (searchCarsViewsView.length === 0) return [];

  const testWallets = env.TEST_WALLETS_ADDRESSES?.split(",") ?? [];

  const cars = await Promise.all(
    searchCarsViewsView.map(async (i: ContractSearchCarWithDistance, index) => {
      if (index === 0) {
        validateContractSearchCarWithDistance(i);
      }
      const metaData = parseMetaData(await getMetaDataFromIpfs(i.car.metadataURI));
      let isCarDetailsConfirmed = false;

      // try {
      //   isCarDetailsConfirmed = await rentality.isCarDetailsConfirmed(i.car.carId);
      // } catch (ex) {
      //   console.error("formatSearchAvailableCarsContractResponse error:", ex);
      // }

      const tripDays = Number(i.car.tripDays);
      const pricePerDay = Number(i.car.pricePerDayInUsdCents) / 100;
      const totalPriceWithDiscount = Number(i.car.totalPriceWithDiscount) / 100;

      let item: SearchCarInfo = {
        carId: Number(i.car.carId),
        ownerAddress: i.car.host.toString(),
        image: getIpfsURI(metaData.mainImage),
        brand: i.car.brand,
        model: i.car.model,
        year: i.car.yearOfProduction.toString(),
        seatsNumber: metaData.seatsNumber,
        transmission: metaData.transmission,
        engineTypeText: getEngineTypeString(i.car.engineType) ?? ENGINE_TYPE_PETROL_STRING,
        milesIncludedPerDayText: getMilesIncludedPerDayText(i.car.milesIncludedPerDay ?? 0),
        pricePerDay: pricePerDay,
        pricePerDayWithDiscount: Number(i.car.pricePerDayWithDiscount) / 100,
        tripDays: tripDays,
        totalPriceWithDiscount: totalPriceWithDiscount,
        taxes: Number(i.car.taxes) / 100,
        securityDeposit: Number(i.car.securityDepositPerTripInUsdCents) / 100,
        hostPhotoUrl: i.car.hostPhotoUrl,
        hostName: i.car.hostName,
        timeZoneId: i.car.locationInfo.timeZoneId,
        location: {
          lat: Number(i.car.locationInfo.latitude),
          lng: Number(i.car.locationInfo.longitude),
        },
        highlighted: false,
        daysDiscount: getDaysDiscount(tripDays),
        totalDiscount: getTotalDiscount(pricePerDay, tripDays, totalPriceWithDiscount),
        hostHomeLocation: `${i.car.locationInfo.city}, ${i.car.locationInfo.state}, ${i.car.locationInfo.country}`,
        deliveryPrices: {
          from1To25milesPrice: Number(i.car.underTwentyFiveMilesInUsdCents) / 100,
          over25MilesPrice: Number(i.car.aboveTwentyFiveMilesInUsdCents) / 100,
        },
        isInsuranceIncluded: i.car.insuranceIncluded,
        pickUpDeliveryFee: Number(i.car.pickUp) / 100,
        dropOffDeliveryFee: Number(i.car.dropOf) / 100,
        isCarDetailsConfirmed: isCarDetailsConfirmed,
        isTestCar: testWallets.includes(i.car.host),
        distanceToUser: Number(i.distance),
      };

      return item;
    })
  );

  if (allSupportedBlockchainList.find((bch) => !bch.isTestnet && bch.chainId === chainId) !== undefined) {
    cars.sort((a, b) => sortByTestWallet(a, b));
  }
  return cars;
}

async function getTimeZoneIdFromAddress(address: string) {
  if (isEmpty(address)) return UTC_TIME_ZONE_ID;

  const GOOGLE_MAPS_API_KEY = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (isEmpty(GOOGLE_MAPS_API_KEY)) {
    console.error("getUtcOffsetMinutesFromLocation error: GOOGLE_MAPS_API_KEY was not set");
    return "";
  }

  const googleGeoCodeResponse = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_MAPS_API_KEY}`
  );

  if (!googleGeoCodeResponse.ok) {
    console.error(`getUtcOffsetMinutesFromLocation error: googleGeoCodeResponse is ${googleGeoCodeResponse.status}`);
    return UTC_TIME_ZONE_ID;
  }

  const googleGeoCodeJson = await googleGeoCodeResponse.json();
  const locationLat = googleGeoCodeJson.results[0]?.geometry?.location?.lat ?? 0;
  const locationLng = googleGeoCodeJson.results[0]?.geometry?.location?.lng ?? 0;

  var googleTimeZoneResponse = await fetch(
    `https://maps.googleapis.com/maps/api/timezone/json?location=${locationLat},${locationLng}&timestamp=0&key=${GOOGLE_MAPS_API_KEY}`
  );
  if (!googleTimeZoneResponse.ok) {
    console.error(`getUtcOffsetMinutesFromLocation error: googleTimeZoneResponse is ${googleTimeZoneResponse.status}`);
    return UTC_TIME_ZONE_ID;
  }

  const googleTimeZoneJson = await googleTimeZoneResponse.json();

  return googleTimeZoneJson?.timeZoneId ?? UTC_TIME_ZONE_ID;
}

function sortByTestWallet(a: SearchCarInfo, b: SearchCarInfo) {
  if (a.isTestCar && !b.isTestCar) {
    return 1;
  } else if (!a.isTestCar && b.isTestCar) {
    return -1;
  } else {
    return 0;
  }
}
