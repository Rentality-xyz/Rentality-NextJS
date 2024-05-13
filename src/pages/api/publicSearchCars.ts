import { getEtherContractWithSigner } from "@/abis";
import { getEngineTypeString } from "@/model/EngineType";
import { getMilesIncludedPerDayText } from "@/model/HostCarInfo";
import { SearchCarRequest } from "@/model/SearchCarRequest";
import { SearchCarInfo } from "@/model/SearchCarsResult";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { ContractSearchCar, ContractSearchCarParams, EngineType } from "@/model/blockchain/schemas";
import { validateContractSearchCar } from "@/model/blockchain/schemas_utils";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { getBlockchainTimeFromDate, getMoneyInCentsFromString } from "@/utils/formInput";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { isEmpty } from "@/utils/string";
import { JsonRpcProvider, Wallet } from "ethers";
import moment from "moment";
import type { NextApiRequest, NextApiResponse } from "next";

export const getDaysDiscount = (tripDays: number) => {
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
};

export const getTotalDiscount = (pricePerDay: number, tripDays: number, totalPriceWithDiscount: number) => {
  const totalDiscount = pricePerDay * tripDays - totalPriceWithDiscount;
  let result: string = "";
  if (totalDiscount > 0) {
    result = "-$" + displayMoneyWith2Digits(totalDiscount);
  } else {
    result = "-";
  }
  return result;
};

const formatSearchAvailableCarsContractRequest = (searchCarRequest: SearchCarRequest, timeZoneId: string) => {
  const startCarLocalDateTime = moment.tz(searchCarRequest.dateFrom, timeZoneId).toDate();
  const endCarLocalDateTime = moment.tz(searchCarRequest.dateTo, timeZoneId).toDate();
  const contractDateFromUTC = getBlockchainTimeFromDate(startCarLocalDateTime);
  const contractDateToUTC = getBlockchainTimeFromDate(endCarLocalDateTime);
  const contractSearchCarParams: ContractSearchCarParams = {
    country: "", //searchCarRequest.searchLocation.country ?? "",
    state: "", //searchCarRequest.searchLocation.state ?? "",
    city: searchCarRequest.searchLocation.city ?? "",
    brand: searchCarRequest.searchFilters.brand ?? "",
    model: searchCarRequest.searchFilters.model ?? "",
    yearOfProductionFrom: BigInt(searchCarRequest.searchFilters.yearOfProductionFrom ?? "0"),
    yearOfProductionTo: BigInt(searchCarRequest.searchFilters.yearOfProductionTo ?? "0"),
    pricePerDayInUsdCentsFrom: BigInt(getMoneyInCentsFromString(searchCarRequest.searchFilters.pricePerDayInUsdFrom)),
    pricePerDayInUsdCentsTo: BigInt(getMoneyInCentsFromString(searchCarRequest.searchFilters.pricePerDayInUsdTo)),
  };
  return { contractDateFromUTC, contractDateToUTC, contractSearchCarParams } as const;
};

const formatSearchAvailableCarsContractResponse = async (searchCarsViewsView: ContractSearchCar[]) => {
  if (searchCarsViewsView.length === 0) return [];

  return await Promise.all(
    searchCarsViewsView.map(async (i: ContractSearchCar, index) => {
      if (index === 0) {
        validateContractSearchCar(i);
      }
      const meta = await getMetaDataFromIpfs(i.metadataURI);

      const tripDays = Number(i.tripDays);
      const pricePerDay = Number(i.pricePerDayInUsdCents) / 100;
      const totalPriceWithDiscount = Number(i.totalPriceWithDiscount) / 100;

      let item: SearchCarInfo = {
        carId: Number(i.carId),
        ownerAddress: i.host.toString(),
        image: getIpfsURIfromPinata(meta.image),
        brand: i.brand,
        model: i.model,
        year: i.yearOfProduction.toString(),
        seatsNumber: meta.attributes?.find((x: any) => x.trait_type === "Seats number")?.value ?? "",
        transmission: meta.attributes?.find((x: any) => x.trait_type === "Transmission")?.value ?? "",
        engineTypeText: getEngineTypeString(i.engineType ?? EngineType.PETROL),
        milesIncludedPerDay: getMilesIncludedPerDayText(i.milesIncludedPerDay ?? 0),
        pricePerDay: pricePerDay,
        pricePerDayWithDiscount: Number(i.pricePerDayWithDiscount) / 100,
        tripDays: tripDays,
        totalPriceWithDiscount: totalPriceWithDiscount,
        deliveryFee: Number(i.deliveryFee) / 100,
        taxes: Number(i.taxes) / 100,
        securityDeposit: Number(i.securityDepositPerTripInUsdCents) / 100,
        hostPhotoUrl: i.hostPhotoUrl,
        hostName: i.hostName,
        timeZoneId: i.timeZoneId,
        location: {
          lat: parseFloat(i.locationLatitude),
          lng: parseFloat(i.locationLongitude),
        },
        highlighted: false,
        daysDiscount: getDaysDiscount(tripDays),
        totalDiscount: getTotalDiscount(pricePerDay, tripDays, totalPriceWithDiscount),
      };

      return item;
    })
  );
};

const getTimeZoneIdFromLocation = async (address: string) => {
  if (isEmpty(address)) return UTC_TIME_ZONE_ID;

  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!GOOGLE_MAPS_API_KEY) {
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
  const dstOffsetInSec = Number(googleTimeZoneJson?.dstOffset) ?? "";
  const rawOffsetInSec = Number(googleTimeZoneJson?.rawOffset) ?? "";
  const offSetInMinutes = (rawOffsetInSec + dstOffsetInSec) / 60 ?? 0;

  return offSetInMinutes;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const privateKey = process.env.NEXT_WALLET_PRIVATE_KEY;
  if (!privateKey) {
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
    brand,
    model,
    yearOfProductionFrom,
    yearOfProductionTo,
    pricePerDayInUsdFrom,
    pricePerDayInUsdTo,
  } = req.query;
  const chainIdNumber = Number(chainId) > 0 ? Number(chainId) : Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID);

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

  const timeZoneId = await getTimeZoneIdFromLocation(location);
  if (isEmpty(timeZoneId)) {
    res.status(500).json({ error: "API checkTrips error: GOOGLE_MAPS_API_KEY was not set" });
    return;
  }

  const searchCarRequest: SearchCarRequest = {
    searchLocation: {
      country: country as string,
      state: state as string,
      city: city as string,
      locationLat: 0,
      locationLng: 0,
      address: "",
    },
    dateFrom: dateFrom as string,
    dateTo: dateTo as string,
    searchFilters: {
      brand: brand as string,
      model: model as string,
      yearOfProductionFrom: yearOfProductionFrom as string,
      yearOfProductionTo: yearOfProductionTo as string,
      pricePerDayInUsdFrom: pricePerDayInUsdFrom as string,
      pricePerDayInUsdTo: pricePerDayInUsdTo as string,
    },
    isDeliveryToGuest: false,
    deliveryInfo: {
      pickupLocation: { isHostHomeLocatiom: true },
      returnLocation: { isHostHomeLocatiom: true },
    },
  };
  console.log(
    `Calling searchAvailableCars API for ${chainIdNumber} chain id with searchCarRequest: ${JSON.stringify(
      searchCarRequest
    )}`
  );

  const provider = new JsonRpcProvider(providerApiUrl);
  const wallet = new Wallet(privateKey, provider);

  const rentality = (await getEtherContractWithSigner("gateway", wallet)) as unknown as IRentalityContract;

  const { contractDateFromUTC, contractDateToUTC, contractSearchCarParams } = formatSearchAvailableCarsContractRequest(
    searchCarRequest,
    timeZoneId
  );

  const availableCarsView: ContractSearchCar[] = await rentality.searchAvailableCars(
    contractDateFromUTC,
    contractDateToUTC,
    contractSearchCarParams
  );

  const availableCarsData = await formatSearchAvailableCarsContractResponse(availableCarsView);

  res.status(200).json(availableCarsData);
}
