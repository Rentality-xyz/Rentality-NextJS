import { env } from "../env";

export default function getProviderApiUrlFromEnv(chainId: number) {
  switch (chainId) {
    case 1337:
      return env.PROVIDER_API_URL_1337;
    case 5611:
      return env.PROVIDER_API_URL_5611;
    case 8453:
      return env.PROVIDER_API_URL_8453;
    case 84532:
      return env.PROVIDER_API_URL_84532;
    case 11155111:
      return env.PROVIDER_API_URL_11155111;
    case 11155420:
      return env.PROVIDER_API_URL_11155420;
  }
}
