import RentalityJSONNet from "./Rentality.json";
import RentalityJSONLocal from "./Rentality.localhost.json";
import RentalityCurrencyConverterJSONNet from "./RentalityCurrencyConverter.json";
import RentalityCurrencyConverterJSONLocal from "./RentalityCurrencyConverter.localhost.json";
import RentalityGatewayJSONNet from "./RentalityGateway.json";
import RentalityGatewayJSONLocal from "./RentalityGateway.localhost.json";


export const rentalityJSON = (process.env.NEXT_PUBLIC_USE_LOCALHOST_BLOCKCHAIN)?.toLowerCase?.() === "true"
? RentalityJSONLocal
: RentalityJSONNet;

export const rentalityJSONv_0_15 = (process.env.NEXT_PUBLIC_USE_LOCALHOST_BLOCKCHAIN)?.toLowerCase?.() === "true"
? RentalityGatewayJSONLocal
: RentalityGatewayJSONNet;

export const rentalityCurrencyConverterJSON = (process.env.NEXT_PUBLIC_USE_LOCALHOST_BLOCKCHAIN)?.toLowerCase?.() === "true"
? RentalityCurrencyConverterJSONLocal
: RentalityCurrencyConverterJSONNet;

export default rentalityJSON;