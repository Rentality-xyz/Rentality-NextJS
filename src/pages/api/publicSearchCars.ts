import { getEtherContractWithSigner } from "@/abis";
import { getEngineTypeString } from "@/model/EngineType";
import { getMilesIncludedPerDayText } from "@/model/HostCarInfo";
import { SearchCarRequest } from "@/model/SearchCarRequest";
import { SearchCarInfo } from "@/model/SearchCarsResult";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { ContractSearchCar, ContractSearchCarParams, EngineType } from "@/model/blockchain/schemas";
import { validateContractSearchCar } from "@/model/blockchain/schemas_utils";
import { getBlockchainTimeFromDate, getMoneyInCentsFromString } from "@/utils/formInput";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
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
    result = "-$" + String(totalDiscount);
  } else {
    result = "-";
  }
  return result;
};

const formatSearchAvailableCarsContractRequest = (searchCarRequest: SearchCarRequest) => {
  const startDateTimeUTC = moment
    .utc(searchCarRequest.dateFrom)
    .subtract(searchCarRequest.utcOffsetMinutes, "minutes")
    .toDate();
  const endDateTimeUTC = moment
    .utc(searchCarRequest.dateTo)
    .subtract(searchCarRequest.utcOffsetMinutes, "minutes")
    .toDate();

  console.log(`utcOffsetMinutes: ${searchCarRequest.utcOffsetMinutes}`);
  console.log(`dateFrom string: ${searchCarRequest.dateFrom}`);
  console.log(`startDateTimeUTC string: ${startDateTimeUTC}`);
  console.log(`dateTo string: ${searchCarRequest.dateTo}`);
  console.log(`endDateTimeUTC string: ${endDateTimeUTC}`);

  const contractDateFromUTC = getBlockchainTimeFromDate(startDateTimeUTC);
  const contractDateToUTC = getBlockchainTimeFromDate(endDateTimeUTC);
  const contractSearchCarParams: ContractSearchCarParams = {
    country: "", //searchCarRequest.country ?? "",
    state: "", //searchCarRequest.state ?? "",
    city: searchCarRequest.city ?? "",
    brand: searchCarRequest.brand ?? "",
    model: searchCarRequest.model ?? "",
    yearOfProductionFrom: BigInt(searchCarRequest.yearOfProductionFrom ?? "0"),
    yearOfProductionTo: BigInt(searchCarRequest.yearOfProductionTo ?? "0"),
    pricePerDayInUsdCentsFrom: BigInt(getMoneyInCentsFromString(searchCarRequest.pricePerDayInUsdFrom)),
    pricePerDayInUsdCentsTo: BigInt(getMoneyInCentsFromString(searchCarRequest.pricePerDayInUsdTo)),
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

      const pricePerDay = Number(i.pricePerDayInUsdCents) / 100;
      const pricePerDayWithDiscount = Number(i.pricePerDayWithDiscount) / 100;
      const tripDays = Number(i.tripDays);
      const totalPriceWithDiscount = Number(i.totalPriceWithDiscount) / 100;
      const taxes = Number(i.taxes) / 100;
      const securityDeposit = Number(i.securityDepositPerTripInUsdCents) / 100;

      let item: SearchCarInfo = {
        carId: Number(i.carId),
        ownerAddress: i.host.toString(),
        image: getIpfsURIfromPinata(meta.image),
        brand: meta.attributes?.find((x: any) => x.trait_type === "Brand")?.value ?? "",
        model: meta.attributes?.find((x: any) => x.trait_type === "Model")?.value ?? "",
        year: meta.attributes?.find((x: any) => x.trait_type === "Release year")?.value ?? "",
        seatsNumber: meta.attributes?.find((x: any) => x.trait_type === "Seats number")?.value ?? "",
        transmission: meta.attributes?.find((x: any) => x.trait_type === "Transmission")?.value ?? "",
        engineTypeText: getEngineTypeString(i.engineType ?? EngineType.PATROL),
        milesIncludedPerDay: getMilesIncludedPerDayText(i.milesIncludedPerDay ?? 0),
        pricePerDay: pricePerDay,
        pricePerDayWithDiscount: pricePerDayWithDiscount,
        tripDays: tripDays,
        totalPriceWithDiscount: totalPriceWithDiscount,
        taxes: taxes,
        securityDeposit: securityDeposit,
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
    utcOffsetMinutes,
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

  const searchCarRequest: SearchCarRequest = {
    dateFrom: dateFrom as string,
    dateTo: dateTo as string,
    country: country as string,
    state: state as string,
    city: city as string,
    utcOffsetMinutes: Number(utcOffsetMinutes ?? "0"),
    brand: brand as string,
    model: model as string,
    yearOfProductionFrom: yearOfProductionFrom as string,
    yearOfProductionTo: yearOfProductionTo as string,
    pricePerDayInUsdFrom: pricePerDayInUsdFrom as string,
    pricePerDayInUsdTo: pricePerDayInUsdTo as string,
  };
  console.log(
    `Calling searchAvailableCars API for ${chainIdNumber} chain id with searchCarRequest: ${JSON.stringify(
      searchCarRequest
    )}`
  );

  const provider = new JsonRpcProvider(providerApiUrl);
  const wallet = new Wallet(privateKey, provider);

  const rentality = (await getEtherContractWithSigner("gateway", wallet)) as unknown as IRentalityContract;

  const { contractDateFromUTC, contractDateToUTC, contractSearchCarParams } =
    formatSearchAvailableCarsContractRequest(searchCarRequest);

  const availableCarsView: ContractSearchCar[] = await rentality.searchAvailableCars(
    contractDateFromUTC,
    contractDateToUTC,
    contractSearchCarParams
  );

  const availableCarsData = await formatSearchAvailableCarsContractResponse(availableCarsView);

  res.status(200).json(availableCarsData);
}
