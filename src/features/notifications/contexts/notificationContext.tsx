import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  NotificationInfo,
  createClaimCreatedChangedNotification,
  createCreateTripNotification,
  createTripChangedNotification,
} from "@/model/NotificationInfo";
import { getEtherContractWithSigner } from "@/abis";
import { isEventLog } from "@/utils/ether";
import { bigIntReplacer } from "@/utils/json";
import { hasValue } from "@/utils/arrays";
import { EventLog, JsonRpcProvider, Listener, Wallet } from "ethers";
import { ClaimStatus, ContractFullClaimInfo, ContractTripDTO, EventType, TripStatus } from "@/model/blockchain/schemas";
import { getBlockCountForSearch } from "@/model/blockchain/blockchainList";
import { useAuth } from "@/contexts/auth/authContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { useRentality } from "@/contexts/rentalityContext";
import { logger } from "@/utils/logger";
import { fetchDefaultRpcUrl } from "../utils/fetchDefaultRpcUrl";
import { isEmpty } from "@/utils/string";

export type NotificationContextInfo = {
  isLoading: boolean;
  notifications: NotificationInfo[];
  loadMore: () => Promise<void>;
  addNotifications: (notifications: NotificationInfo[]) => void;
};

const NotificationContext = createContext<NotificationContextInfo>({
  isLoading: true,
  notifications: [],
  loadMore: async () => {},
  addNotifications: () => {},
});

export function useNotification() {
  return useContext(NotificationContext);
}

function getNotificationFromRentalityEvent(
  tripInfos: ContractTripDTO[],
  claimInfos: ContractFullClaimInfo[],
  isHost: boolean
): (value: EventLog) => Promise<NotificationInfo | undefined> {
  return async (event) => {
    const eventType = BigInt(event.args[0]);

    switch (eventType) {
      case EventType.Trip:
        const tripId = BigInt(event.args[1]);
        const tripStatus = BigInt(event.args[2]);

        const tripDTO = tripInfos.find((i) => i.trip.tripId === tripId);
        if (!tripDTO) return;

        const eventDate = (await event.getBlock()).date ?? new Date();

        if (tripStatus === TripStatus.Pending) {
          return createCreateTripNotification(tripDTO, isHost, eventDate);
        } else {
          return createTripChangedNotification(tripStatus, tripDTO, isHost, eventDate);
        }
      case EventType.Claim:
        const claimId = BigInt(event.args[1]);
        const claimStatus: ClaimStatus = BigInt(event.args[2]);

        if (claimStatus !== ClaimStatus.NotPaid) return;

        const claimInfo = claimInfos.find((i) => i.claim.claimId === claimId);
        if (!claimInfo) return;

        const claimTripDTO = tripInfos.find((i) => i.trip.tripId === claimInfo.claim.tripId);
        if (!claimTripDTO) return;

        const claimEventDate = (await event.getBlock()).date ?? new Date();
        return createClaimCreatedChangedNotification(claimTripDTO, claimInfo, isHost, claimEventDate);
    }
  };
}

function getFromBlock(chainId: number, toBlock: number): number {
  const blockCountForSearch = getBlockCountForSearch(chainId);
  if (blockCountForSearch === Number.POSITIVE_INFINITY) return 0;
  return toBlock > blockCountForSearch ? toBlock - blockCountForSearch : 0;
}

export const NotificationProvider = ({ isHost, children }: { isHost: boolean; children?: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notificationInfos, setNotificationInfos] = useState<NotificationInfo[]>([]);

  const loadMore = async () => {};

  const addNotifications = useCallback((notifications: NotificationInfo[]) => {
    setNotificationInfos((prev) => {
      const result = [...prev];
      notifications = notifications.filter(
        (newItem) => result.findIndex((existItem) => existItem.id === newItem.id) === -1
      );
      result.push(...notifications);
      return result.sort((a, b) => {
        return b.datestamp.getTime() - a.datestamp.getTime();
      });
    });
  }, []);

  const rentalityEventListener: Listener = useCallback(
    async ({ args }) => {
      logger.info(`Rentality Event | args: ${JSON.stringify(args, bigIntReplacer)}`);

      if (!rentalityContracts) return;

      const eventType = BigInt(args[0]);

      switch (eventType) {
        case EventType.Trip:
          const tripId = BigInt(args[1]);
          const tripStatus = BigInt(args[2]);

          if (tripStatus === TripStatus.Pending) {
            try {
              const result = await rentalityContracts.gateway.getTrip(tripId);
              if (!result.ok) return;

              const notification = await createCreateTripNotification(result.value, isHost, new Date());
              if (!notification) return;

              addNotifications([notification]);
            } catch (error) {
              logger.error("rentalityEventListener error:" + error);
            }
          } else {
            try {
              const result = await rentalityContracts.gateway.getTrip(tripId);
              if (!result.ok) return;

              const notification = await createTripChangedNotification(tripStatus, result.value, isHost, new Date());
              if (!notification) return;

              addNotifications([notification]);
            } catch (error) {
              logger.error("rentalityEventListener error:" + error);
            }
          }
          return;

        case EventType.Claim:
          const claimId = BigInt(args[1]);

          try {
            const getClaimResult = await rentalityContracts.gateway.getClaim(claimId);
            if (!getClaimResult.ok) return;

            const getTripResult = await rentalityContracts.gateway.getTrip(getClaimResult.value.claim.tripId);
            if (!getTripResult.ok) return;

            const notification = await createClaimCreatedChangedNotification(
              getTripResult.value,
              getClaimResult.value,
              isHost,
              new Date()
            );
            if (!notification) return;

            addNotifications([notification]);
          } catch (error) {
            logger.error("rentalityEventListener error:" + error);
          }
          return;
      }
    },
    [rentalityContracts, isHost, addNotifications]
  );

  useEffect(() => {
    const initialLoading = async () => {
      if (!ethereumInfo) return;
      if (!rentalityContracts) return;

      try {
        const defaultRpcUrl = await fetchDefaultRpcUrl(ethereumInfo.chainId);

        if (isEmpty(defaultRpcUrl)) {
          return null;
        }

        const provider = new JsonRpcProvider(defaultRpcUrl);
        const randomSigner = Wallet.createRandom();

        const signerWithProvider = randomSigner.connect(provider);
        const notificationService = await getEtherContractWithSigner("notificationService", signerWithProvider);
        if (!notificationService) {
          logger.error("initialLoading error: notificationService is null");
          return false;
        }

        const toBlock = await ethereumInfo.provider.getBlockNumber();
        const fromBlock = getFromBlock(ethereumInfo.chainId, toBlock);

        const getTripsResult = await rentalityContracts.gateway.getTripsAs(isHost);
        const getMyClaimsResult = await rentalityContracts.gateway.getMyClaimsAs(isHost);

        if (!getTripsResult.ok || !getMyClaimsResult.ok) return;

        const rentalityEventFilterFromUser = notificationService.filters.RentalityEvent(
          null,
          null,
          null,
          [ethereumInfo.walletAddress],
          null,
          null
        );
        const rentalityEventFilterToUser = notificationService.filters.RentalityEvent(
          null,
          null,
          null,
          null,
          [ethereumInfo.walletAddress],
          null
        );
        const rentalityEventHistory = (
          await notificationService.queryFilter(rentalityEventFilterFromUser, fromBlock, toBlock)
        )
          .concat(await notificationService.queryFilter(rentalityEventFilterToUser, fromBlock, toBlock))
          .filter(isEventLog);

        const notificationsRentalityEventHistory = await Promise.all(
          rentalityEventHistory.map(
            getNotificationFromRentalityEvent(getTripsResult.value, getMyClaimsResult.value, isHost)
          )
        );

        const notifications: NotificationInfo[] = notificationsRentalityEventHistory.filter(hasValue);

        addNotifications(notifications);

        await notificationService.removeAllListeners();
        await notificationService.on(rentalityEventFilterFromUser, rentalityEventListener);
        await notificationService.on(rentalityEventFilterToUser, rentalityEventListener);
      } catch (error) {
        logger.error("initialLoading error:" + error);
      } finally {
        setIsLoading(false);
      }
    };

    initialLoading();
  }, [ethereumInfo, rentalityContracts, isHost, rentalityEventListener, addNotifications]);

  useEffect(() => {
    if (!isAuthenticated && notificationInfos.length > 0) {
      logger.debug(`User has logged out. Reset notificationInfos`);
      setNotificationInfos([]);
    }
  }, [isAuthenticated, notificationInfos]);

  const contextValue: NotificationContextInfo = useMemo(() => {
    return {
      isLoading: isLoading,
      notifications: notificationInfos,
      loadMore: loadMore,
      addNotifications: addNotifications,
    };
  }, [isLoading, notificationInfos, addNotifications]);

  return <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>;
};
