import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  NotificationInfo,
  createClaimCreatedChangedNotification,
  createCreateTripNotification,
  createTripChangedNotification,
} from "@/model/NotificationInfo";
import { getEtherContractWithSigner } from "@/abis";
import { useEthereum } from "../web3/ethereumContext";
import { useRentality } from "../rentalityContext";
import { isEventLog } from "@/utils/ether";
import { bigIntReplacer } from "@/utils/json";
import { hasValue } from "@/utils/arrays";
import { EventLog, Listener } from "ethers";
import { ClaimStatus, ContractFullClaimInfo, ContractTripDTO, EventType, TripStatus } from "@/model/blockchain/schemas";
import { getBlockCountForSearch } from "@/model/blockchain/blockchainList";
import { useAuth } from "../auth/authContext";

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
  const rentalityContract = useRentality();
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
      console.log(`Rentality Event | args: ${JSON.stringify(args, bigIntReplacer)}`);

      if (!rentalityContract) return;

      const eventType = BigInt(args[0]);

      switch (eventType) {
        case EventType.Trip:
          const tripId = BigInt(args[1]);
          const tripStatus = BigInt(args[2]);

          if (tripStatus === TripStatus.Pending) {
            try {
              const tripInfo: ContractTripDTO = await rentalityContract.getTrip(tripId);
              const notification = await createCreateTripNotification(tripInfo, isHost, new Date());
              if (!notification) return;

              addNotifications([notification]);
            } catch (e) {
              console.error("rentalityEventListener error:" + e);
            }
          } else {
            try {
              const tripInfo: ContractTripDTO = await rentalityContract.getTrip(tripId);
              const notification = await createTripChangedNotification(tripStatus, tripInfo, isHost, new Date());
              if (!notification) return;

              addNotifications([notification]);
            } catch (e) {
              console.error("rentalityEventListener error:" + e);
            }
          }
          return;

        case EventType.Claim:
          const claimId = BigInt(args[1]);

          try {
            const claimInfo: ContractFullClaimInfo = await rentalityContract.getClaim(claimId);
            if (!claimInfo) return;

            const tripInfo: ContractTripDTO = await rentalityContract.getTrip(claimInfo.claim.tripId);
            const notification = await createClaimCreatedChangedNotification(tripInfo, claimInfo, isHost, new Date());
            if (!notification) return;

            addNotifications([notification]);
          } catch (e) {
            console.error("rentalityEventListener error:" + e);
          }
          return;
      }
    },
    [rentalityContract, isHost, addNotifications]
  );

  useEffect(() => {
    const initialLoading = async () => {
      if (!ethereumInfo) return;
      if (!rentalityContract) return;

      try {
        const notificationService = await getEtherContractWithSigner("notificationService", ethereumInfo.signer);
        if (!notificationService) {
          console.error("initialLoading error: notificationService is null");
          return false;
        }

        const toBlock = await ethereumInfo.provider.getBlockNumber();
        const fromBlock = getFromBlock(ethereumInfo.chainId, toBlock);

        const tripInfos = await rentalityContract.getTripsAs(isHost);
        const claimInfos = await rentalityContract.getMyClaimsAs(isHost);

        const rentalityEventFilter = notificationService.filters.RentalityEvent(
          null,
          null,
          null,
          [ethereumInfo.walletAddress],
          [ethereumInfo.walletAddress],
          null
        );
        const rentalityEventHistory = (
          await notificationService.queryFilter(rentalityEventFilter, fromBlock, toBlock)
        ).filter(isEventLog);

        const notificationsRentalityEventHistory = await Promise.all(
          rentalityEventHistory.map(getNotificationFromRentalityEvent(tripInfos, claimInfos, isHost))
        );

        const notifications: NotificationInfo[] = notificationsRentalityEventHistory.filter(hasValue);

        addNotifications(notifications);

        await notificationService.removeAllListeners();
        await notificationService.on(rentalityEventFilter, rentalityEventListener);
      } catch (e) {
        console.error("initialLoading error:" + e);
      } finally {
        setIsLoading(false);
      }
    };

    initialLoading();
  }, [ethereumInfo, rentalityContract, isHost, rentalityEventListener, addNotifications]);

  useEffect(() => {
    if (!isAuthenticated && notificationInfos.length > 0) {
      console.debug(`User has logged out. Reset notificationInfos`);
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
