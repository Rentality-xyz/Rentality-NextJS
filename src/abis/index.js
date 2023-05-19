import RentCarJSONNet from "./RentCar.json";
import RentCarJSONLocal from "./RentCar.localhost.json";
import RentalityJSONLocal from "./Rentality.localhost.json";

const rentCarJSON = (process.env.NEXT_PUBLIC_USE_LOCALHOST_BLOCKCHAIN)?.toLowerCase?.() === "true"
? RentCarJSONLocal
: RentCarJSONNet;

export const rentalityJSON = (process.env.NEXT_PUBLIC_USE_LOCALHOST_BLOCKCHAIN)?.toLowerCase?.() === "true"
? RentalityJSONLocal
: RentalityJSONLocal;

export default rentCarJSON;