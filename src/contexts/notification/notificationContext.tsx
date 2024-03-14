import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  NotificationInfo,
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
import { ContractTripDTO, TripStatus } from "@/model/blockchain/schemas";

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

export const NotificationProvider = ({ isHost, children }: { isHost: boolean; children?: React.ReactNode }) => {
  const ethereumInfo = useEthereum();
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [notificationInfos, setNotificationInfos] = useState<NotificationInfo[]>([]);

  const loadMore = async () => {};

  const addNotifications = (notifications: NotificationInfo[]) => {
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
  };

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
    [notificationInfos, rentalityContract]
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
    [notificationInfos, rentalityContract]
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

        const tripInfos = isHost ? await rentalityContract.getTripsAsHost() : await rentalityContract.getTripsAsGuest();

        const eventTripCreatedFilter = isHost
          ? tripServiceContract.filters.TripCreated(null, [ethereumInfo.walletAddress], null)
          : tripServiceContract.filters.TripCreated(null, null, [ethereumInfo.walletAddress]);
        const eventTripCreatedHistory = (await tripServiceContract.queryFilter(eventTripCreatedFilter)).filter(
          isEventLog
        );
        const notificationsTripCreatedHistory = await Promise.all(
          eventTripCreatedHistory.map(getNotificationFromCreateTripEvent(tripInfos, isHost))
        );

        const eventTripStatusChangedFilter = isHost
          ? tripServiceContract.filters.TripStatusChanged(null, null, [ethereumInfo.walletAddress], null)
          : tripServiceContract.filters.TripStatusChanged(null, null, null, [ethereumInfo.walletAddress]);
        const eventTripStatusChangedHistory = (
          await tripServiceContract.queryFilter(eventTripStatusChangedFilter)
        ).filter(isEventLog);
        const notificationsTripStatusChangedHistory = await Promise.all(
          eventTripStatusChangedHistory.map(getNotificationFromTripChangedEvent(tripInfos, isHost))
        );

        // console.log(`eventTripCreatedHistory: ${JSON.stringify(eventTripCreatedHistory, bigIntReplacer)}`);
        // console.log(`eventTripStatusChangedHistory: ${JSON.stringify(eventTripStatusChangedHistory, bigIntReplacer)}`);

        const notifications: NotificationInfo[] = notificationsTripCreatedHistory
          .concat(notificationsTripStatusChangedHistory)
          .filter(hasValue);

        addNotifications(notifications);

        await tripServiceContract.removeAllListeners();
        await tripServiceContract.on(eventTripCreatedFilter, tripCreatedListener);
        await tripServiceContract.on(eventTripStatusChangedFilter, tripStatusChangedListener);
      } catch (e) {
        console.error("initialLoading error:" + e);
      } finally {
        setIsLoading(false);
      }
    };

    initialLoading();
  }, [ethereumInfo, rentalityContract]);

  const contextValue: NotificationContextInfo = useMemo(() => {
    return {
      isLoading: isLoading,
      notifications: notificationInfos,
      loadMore: loadMore,
      addNotifications: addNotifications,
    };
  }, [isLoading, notificationInfos]);

  return <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>;
};