import { env } from "../../env";

export default function getIndexerUrlFromEnv(chainId: number) {
  switch (chainId) {
    case 1337:
      return env.INDEXER_URL_84532;
    case 5611:
      return env.INDEXER_URL_5611;
    case 8453:
      return env.INDEXER_URL_8453;
    case 84532:
      return env.INDEXER_URL_84532;
    case 204:
      return env.INDEXER_URL_204;
    case 11155111:
      return env.INDEXER_URL_11155111;
    case 11155420:
      return env.INDEXER_URL_11155420;
  }
}
