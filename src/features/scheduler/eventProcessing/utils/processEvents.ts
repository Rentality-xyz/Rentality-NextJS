import { Err, Ok, Result, UnknownErr } from "@/model/utils/result";
import { ethers, JsonRpcProvider, Wallet } from "ethers";
import { logger } from "@/utils/logger";
import { isEmpty } from "@/utils/string";
import { getBlockCountForSearch } from "@/model/blockchain/blockchainList";
import { cacheDbInfo, readDocFromFirebaseDb, saveDocToFirebaseDb } from "@/utils/firebase";
import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";
import { RentalityEvent } from "../models";
import { getEtherContractWithSigner } from "@/abis";
import { isEventLog } from "@/utils/ether";
import { EventType } from "@/model/blockchain/schemas";
import UserService from "./userService";
import EmailService from "./emailService";

export async function processEvents(
  chainId: number,
  baseUrl: string
): Promise<Result<{ processed: number; errors: string[] }>> {
  try {
    const userService = new UserService();
    const emailService = new EmailService();

    const lastProcessedNumberResult = await getLastProcessedBlockNumber(chainId);
    if (!lastProcessedNumberResult.ok) {
      return lastProcessedNumberResult;
    }

    const currentBlockNumberResult = await getCurrentBlockNumber(chainId);
    if (!currentBlockNumberResult.ok) {
      return currentBlockNumberResult;
    }

    const blockLimit = getBlockLimit(chainId);
    const blocksToProcess = splitBlocksBasedOnLimit(
      lastProcessedNumberResult.value,
      currentBlockNumberResult.value,
      blockLimit
    );

    let processed = 0;
    const errors: string[] = [];

    for (const { from, to } of blocksToProcess) {
      const eventsResult = await getEvents(chainId, from, to);
      if (!eventsResult.ok) continue;

      const events = eventsResult.value;

      for (const event of events) {
        try {
          const userFromInfoResult = await userService.getUserInfo(chainId, event.from);
          const userToInfoResult = await userService.getUserInfo(chainId, event.to);

          if (!userFromInfoResult.ok && !userToInfoResult.ok) {
            errors.push(
              `Failed to get user info for ${event.from} and ${event.to}: ${userFromInfoResult.error.message}`
            );
            continue;
          }
          const userFromInfo = userFromInfoResult.ok ? userFromInfoResult.value : null;
          const userToInfo = userToInfoResult.ok ? userToInfoResult.value : null;

          const emailResult = await emailService.processEvent(event, userFromInfo, userToInfo, baseUrl);

          if (!emailResult.ok) {
            errors.push(`Failed to send email for event ${event.id}: ${emailResult.error.message}`);
            continue;
          }

          processed++;
        } catch (error) {
          errors.push(`Error processing event ${event.id}: ${(error as Error).message}`);
        }
      }

      await saveLastProcessedBlockNumber(chainId, to);
    }

    return Ok({ processed, errors });
  } catch (error) {
    return Err(error as Error);
  }
}

async function getLastProcessedBlockNumber(chainId: number): Promise<Result<number>> {
  var result = await readDocFromFirebaseDb<{ lastProcessedBlockNumber: number }>(
    cacheDbInfo.db,
    cacheDbInfo.collections.eventProcessing,
    [chainId.toString()]
  );

  if (!result.ok) {
    return result;
  }

  return Ok(result.value?.lastProcessedBlockNumber ?? 0);
}

async function saveLastProcessedBlockNumber(
  chainId: number,
  lastProcessedBlockNumber: number
): Promise<Result<boolean>> {
  return saveDocToFirebaseDb(cacheDbInfo.db, cacheDbInfo.collections.eventProcessing, [chainId.toString()], {
    lastProcessedBlockNumber,
  });
}

async function getCurrentBlockNumber(chainId: number): Promise<Result<number>> {
  try {
    const providerApiUrl = getProviderApiUrlFromEnv(chainId);
    if (isEmpty(providerApiUrl)) {
      return Err(new Error(`Provider API URL for chain id ${chainId} was not found`));
    }
    const provider = new ethers.JsonRpcProvider(providerApiUrl);
    return Ok(await provider.getBlockNumber());
  } catch (error) {
    logger.error(`getCurrentBlockNumber error: Error fetching current block number for chainId ${chainId}:`, error);
    return UnknownErr(error);
  }
}

function getBlockLimit(chainId: number) {
  return getBlockCountForSearch(chainId);
}

function splitBlocksBasedOnLimit(
  lastProcessedNumber: number,
  currentBlockNumber: number,
  blockLimit: number
): { from: number; to: number }[] {
  if (lastProcessedNumber === 0) {
    return [{ from: Math.max(currentBlockNumber - blockLimit + 1, 0), to: currentBlockNumber }];
  }

  const result: { from: number; to: number }[] = [];
  let start = lastProcessedNumber;

  while (start < currentBlockNumber) {
    const end = Math.min(start + blockLimit - 1, currentBlockNumber);
    result.push({ from: start, to: end });
    start = end;
  }

  return result.slice(-50);
}

async function getEvents(chainId: number, fromBlock: number, toBlock: number): Promise<Result<RentalityEvent[]>> {
  try {
    const providerApiUrl = getProviderApiUrlFromEnv(chainId);
    if (isEmpty(providerApiUrl)) {
      return Err(new Error(`API URL for chain id ${chainId} was not set`));
    }

    const provider = new JsonRpcProvider(providerApiUrl);
    const randomSigner = Wallet.createRandom();

    const signerWithProvider = randomSigner.connect(provider);
    const notificationService = await getEtherContractWithSigner("notificationService", signerWithProvider);
    if (!notificationService) {
      logger.error("getEvents error: notificationService is null");
      return Err(new Error("getEvents error: notificationService is null"));
    }

    const rentalityEventFilterFromUser = notificationService.filters.RentalityEvent(null, null, null, null, null, null);

    const rentalityEventHistory = (
      await notificationService.queryFilter(rentalityEventFilterFromUser, fromBlock, toBlock)
    ).filter(isEventLog);

    return Ok(
      rentalityEventHistory.map((event) => {
        return {
          eType: event.args[0] as EventType,
          id: event.args[1],
          objectStatus: event.args[2],
          from: event.args[3],
          to: event.args[4],
          timestamp: event.args[5],
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        };
      })
    );
  } catch (error) {
    logger.error("Notification context initialization error:" + error);
    return UnknownErr(error);
  }
}
