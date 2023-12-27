import RentalityGatewayJSON_80001 from "./RentalityGateway.80001.json";
import RentalityGatewayJSON_84532 from "./RentalityGateway.84532.json";
import RentalityGatewayJSON_11155111 from "./RentalityGateway.11155111.json";
import RentalityGatewayJSON_localhost from "./RentalityGateway.localhost.json";
import RentalityCurrencyConverterJSON_80001 from "./RentalityCurrencyConverter.80001.json";
import RentalityCurrencyConverterJSON_84532 from "./RentalityCurrencyConverter.84532.json";
import RentalityCurrencyConverterJSON_11155111 from "./RentalityCurrencyConverter.11155111.json";
import RentalityCurrencyConverterJSON_localhost from "./RentalityCurrencyConverter.localhost.json";
import RentalityChatHelperJSON_80001 from "./RentalityChatHelper.80001.json";
import RentalityChatHelperJSON_84532 from "./RentalityChatHelper.84532.json";
import RentalityChatHelperJSON_11155111 from "./RentalityChatHelper.11155111.json";
import RentalityChatHelperJSON_localhost from "./RentalityChatHelper.localhost.json";

export const rentalityContracts = {
  1337: {
    gateway: {
      address: RentalityGatewayJSON_localhost.address,
      abi: RentalityGatewayJSON_localhost.abi,
    },
    currencyConverter: {
      address: RentalityCurrencyConverterJSON_localhost.address,
      abi: RentalityCurrencyConverterJSON_localhost.abi,
    },
    chatHelper: {
      address: RentalityChatHelperJSON_localhost.address,
      abi: RentalityChatHelperJSON_localhost.abi,
    },
  },
  80001: {
    gateway: {
      address: RentalityGatewayJSON_80001.address,
      abi: RentalityGatewayJSON_80001.abi,
    },
    currencyConverter: {
      address: RentalityCurrencyConverterJSON_80001.address,
      abi: RentalityCurrencyConverterJSON_80001.abi,
    },
    chatHelper: {
      address: RentalityChatHelperJSON_80001.address,
      abi: RentalityChatHelperJSON_80001.abi,
    },
  },
  84532: {
    gateway: {
      address: RentalityGatewayJSON_84532.address,
      abi: RentalityGatewayJSON_84532.abi,
    },
    currencyConverter: {
      address: RentalityCurrencyConverterJSON_84532.address,
      abi: RentalityCurrencyConverterJSON_84532.abi,
    },
    chatHelper: {
      address: RentalityChatHelperJSON_84532.address,
      abi: RentalityChatHelperJSON_84532.abi,
    },
  },
  11155111: {
    gateway: {
      address: RentalityGatewayJSON_11155111.address,
      abi: RentalityGatewayJSON_11155111.abi,
    },
    currencyConverter: {
      address: RentalityCurrencyConverterJSON_11155111.address,
      abi: RentalityCurrencyConverterJSON_11155111.abi,
    },
    chatHelper: {
      address: RentalityChatHelperJSON_11155111.address,
      abi: RentalityChatHelperJSON_11155111.abi,
    },
  },
};

export default rentalityContracts;
