import RentCarJSONNet from "./RentCar.json";
import RentCarJSONLocal from "./RentCar.localhost.json";
import RentalityJSONNet from "./Rentality.json";
import RentalityJSONLocal from "./Rentality.localhost.json";
import RentalityCurrencyConverterJSONNet from "./RentalityCurrencyConverter.json";
import RentalityCurrencyConverterJSONLocal from "./RentalityCurrencyConverter.localhost.json";

const rentCarJSON = (process.env.NEXT_PUBLIC_USE_LOCALHOST_BLOCKCHAIN)?.toLowerCase?.() === "true"
? RentCarJSONLocal
: RentCarJSONNet;

export const rentalityJSON = (process.env.NEXT_PUBLIC_USE_LOCALHOST_BLOCKCHAIN)?.toLowerCase?.() === "true"
? RentalityJSONLocal
: RentalityJSONNet;

export const rentalityCurrencyConverterJSON = (process.env.NEXT_PUBLIC_USE_LOCALHOST_BLOCKCHAIN)?.toLowerCase?.() === "true"
? RentalityCurrencyConverterJSONLocal
: RentalityCurrencyConverterJSONNet;

export default rentCarJSON;