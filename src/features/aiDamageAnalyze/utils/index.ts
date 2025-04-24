import { logger } from "@/utils/logger";

export function parseAiDamageAnalyzeCaseNumber(caseNumber: string) {
  logger.debug(`Parsing case number ${caseNumber}...`);

  const values = caseNumber.split("-");
  if (values.length !== 3) {
    return { chainId: 0, tripId: 0, type: "Unknown" };
  }
  const [chainIdString, tripIdString, type] = values;
  const chainId = parseInt(chainIdString, 10);
  const tripId = parseInt(tripIdString, 10);
  const result = { chainId, tripId, type };

  logger.debug(`Parsed value is : ${JSON.stringify(result)}`);

  return result;
}

export function generateAiDamageAnalyzeCaseNumber(chainId: number, tripId: number, pre: boolean) {
  return `${chainId}-${tripId}-${pre ? "Pre" : "Post"}`;
}
