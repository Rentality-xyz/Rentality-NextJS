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
import { ClaimStatus, ContractFullClaimInfo, ContractTripDTO, TripStatus } from "@/model/blockchain/schemas";
import { getBlockCountForSearch } from "@/model/blockchain/blockchainList";
import { useAuth } from "../auth/authContext";

export type NotificationContextInfo = {
  isLoading: Boolean;
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

function getNotificationFromCreateTripEvent(
  tripInfos: ContractTripDTO[],
  isHost: boolean
): (value: EventLog) => Promise<NotificationInfo | undefined> {
  return async (event) => {
    const tripId = BigInt(event.args[0]);
    const tripDTO = tripInfos.find((i) => i.trip.tripId === tripId);

    if (!tripDTO) return;

    const eventDate = (await event.getBlock()).date ?? new Date();
    return createCreateTripNotification(tripDTO, isHost, eventDate);
  };
}

function getNotificationFromTripChangedEvent(
  tripInfos: ContractTripDTO[],
  isHost: boolean
): (value: EventLog) => Promise<NotificationInfo | undefined> {
  return async (event) => {
    const tripId = BigInt(event.args[0]);
    const tripStatus: TripStatus = BigInt(event.args[1]);
    const tripDTO = tripInfos.find((i) => i.trip.tripId === tripId);

    if (!tripDTO) return;
    const eventDate = (await event.getBlock()).date ?? new Date();
    return createTripChangedNotification(tripStatus, tripDTO, isHost, eventDate);
  };
}

function getNotificationFromClaimStatusChanged(
  tripInfos: ContractTripDTO[],
  claimInfos: ContractFullClaimInfo[],
  isHost: boolean
): (value: EventLog) => Promise<NotificationInfo | undefined> {
  return async (event) => {
    const claimId = BigInt(event.args[0]);
    const claimStatus: ClaimStatus = BigInt(event.args[1]);

    if (claimStatus !== ClaimStatus.NotPaid) return;
    const claimInfo = claimInfos.find((i) => i.claim.claimId === claimId);
    if (!claimInfo) return;

    const tripDTO = tripInfos.find((i) => i.trip.tripId === claimInfo.claim.tripId);

    if (!tripDTO) return;
    const eventDate = (await event.getBlock()).date ?? new Date();
    return createClaimCreatedChangedNotification(tripDTO, claimInfo, isHost, eventDate);
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
  const [isLoading, setIsLoading] = useState<Boolean>(true);
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

  const tripCreatedListener: Listener = useCallback(
    async ({ args }) => {
      console.log(`Trip was created | args: ${JSON.stringify(args, bigIntReplacer)}`);

      if (!rentalityContract) return;

      const tripId = BigInt(args[0]);

      try {
        const tripInfo: ContractTripDTO = await rentalityContract.getTrip(tripId);
        const notification = await createCreateTripNotification(tripInfo, isHost, new Date());
        if (!notification) return;

        addNotifications([notification]);
      } catch (e) {
        console.error("tripCreatedListener error:" + e);
      }
    },
    [rentalityContract, isHost]
  );

  const tripStatusChangedListener: Listener = useCallback(
    async ({ args }) => {
      console.log(`Trip was changed | args: ${JSON.stringify(args, bigIntReplacer)}`);

      if (!rentalityContract) return;

      const tripId = BigInt(args[0]);
      const tripStatus: TripStatus = BigInt(args[1]);

      try {
        const tripInfo: ContractTripDTO = await rentalityContract.getTrip(tripId);
        const notification = await createTripChangedNotification(tripStatus, tripInfo, isHost, new Date());
        if (!notification) return;

        addNotifications([notification]);
      } catch (e) {
        console.error("tripStatusChangedListener error:" + e);
      }
    },
    [rentalityContract, isHost]
  );

  const claimStatusChangedListener: Listener = useCallback(
    async ({ args }) => {
      console.log(`Claim was changed | args: ${JSON.stringify(args, bigIntReplacer)}`);

      if (!rentalityContract) return;

      const claimId = BigInt(args[0]);

      try {
        const claimInfo: ContractFullClaimInfo = await rentalityContract.getClaim(claimId);
        if (!claimInfo) return;

        const tripInfo: ContractTripDTO = await rentalityContract.getTrip(claimInfo.claim.tripId);
        const notification = await createClaimCreatedChangedNotification(tripInfo, claimInfo, isHost, new Date());
        if (!notification) return;

        addNotifications([notification]);
      } catch (e) {
        console.error("claimStatusChangedListener error:" + e);
      }
    },
    [rentalityContract, isHost]
  );

  useEffect(() => {
    const initialLoading = async () => {
      if (!ethereumInfo) return;
      if (!rentalityContract) return;

      try {
        const tripServiceContract = await getEtherContractWithSigner("tripService", ethereumInfo.signer);
        if (tripServiceContract == null) {
          console.error("initialLoading error: tripServiceContract is null");
          return false;
        }
        const claimServiceContract = await getEtherContractWithSigner("claimService", ethereumInfo.signer);
        if (claimServiceContract == null) {
          console.error("initialLoading error: claimServiceContract is null");
          return false;
        }

        const toBlock = await ethereumInfo.provider.getBlockNumber();
        const fromBlock = getFromBlock(ethereumInfo.chainId, toBlock);

        const tripInfos = await rentalityContract.getTripsAs(isHost);
        const claimInfos = await rentalityContract.getMyClaimsAs(isHost);

        const eventTripCreatedFilter = isHost
          ? tripServiceContract.filters.TripCreated(null, [ethereumInfo.walletAddress], null)
          : tripServiceContract.filters.TripCreated(null, null, [ethereumInfo.walletAddress]);
        const eventTripCreatedHistory = (
          await tripServiceContract.queryFilter(eventTripCreatedFilter, fromBlock, toBlock)
        ).filter(isEventLog);
        const notificationsTripCreatedHistory = await Promise.all(
          eventTripCreatedHistory.map(getNotificationFromCreateTripEvent(tripInfos, isHost))
        );

        const eventTripStatusChangedFilter = isHost
          ? tripServiceContract.filters.TripStatusChanged(null, null, [ethereumInfo.walletAddress], null)
          : tripServiceContract.filters.TripStatusChanged(null, null, null, [ethereumInfo.walletAddress]);
        const eventTripStatusChangedHistory = (
          await tripServiceContract.queryFilter(eventTripStatusChangedFilter, fromBlock, toBlock)
        ).filter(isEventLog);
        const notificationsTripStatusChangedHistory = await Promise.all(
          eventTripStatusChangedHistory.map(getNotificationFromTripChangedEvent(tripInfos, isHost))
        );

        const eventClaimStatusChangedFilter = isHost
          ? claimServiceContract.filters.ClaimStatusChanged(null, null, [ethereumInfo.walletAddress], null)
          : claimServiceContract.filters.ClaimStatusChanged(null, null, null, [ethereumInfo.walletAddress]);
        const eventClaimStatusChangedHistory = (
          await claimServiceContract.queryFilter(eventClaimStatusChangedFilter, fromBlock, toBlock)
        ).filter(isEventLog);
        const notificationsClaimStatusChangedHistory = await Promise.all(
          eventClaimStatusChangedHistory.map(getNotificationFromClaimStatusChanged(tripInfos, claimInfos, isHost))
        );

        const notifications: NotificationInfo[] = notificationsTripCreatedHistory
          .concat(notificationsTripStatusChangedHistory)
          .concat(notificationsClaimStatusChangedHistory)
          .filter(hasValue);

        addNotifications(notifications);

        await tripServiceContract.removeAllListeners();
        await tripServiceContract.on(eventTripCreatedFilter, tripCreatedListener);
        await tripServiceContract.on(eventTripStatusChangedFilter, tripStatusChangedListener);
        await claimServiceContract.removeAllListeners();
        await claimServiceContract.on(eventClaimStatusChangedFilter, claimStatusChangedListener);
      } catch (e) {
        console.error("initialLoading error:" + e);
      } finally {
        setIsLoading(false);
      }
    };

    initialLoading();
  }, [
    ethereumInfo,
    rentalityContract,
    isHost,
    tripCreatedListener,
    tripStatusChangedListener,
    claimStatusChangedListener,
    addNotifications,
  ]);

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
