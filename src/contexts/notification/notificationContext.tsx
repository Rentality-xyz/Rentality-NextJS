import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  NotificationInfo,
  getNotificationFromCreateTripEvent,
  getNotificationFromTripChangedEvent,
} from "@/model/NotificationInfo";
import { getEtherContractWithSigner } from "@/abis";
import { useEthereum } from "../web3/ethereumContext";
import { useRentality } from "../rentalityContext";
import { isEventLog } from "@/utils/ether";
import { bigIntReplacer } from "@/utils/json";
import { hasValue } from "@/utils/arrays";

export type NotificationContextInfo = {
  isLoading: Boolean;
  notifications: NotificationInfo[];
};

const NotificationContext = createContext<NotificationContextInfo>({ isLoading: true, notifications: [] });

export function useNotification() {
  return useContext(NotificationContext);
}

export const NotificationProvider = ({ isHost, children }: { isHost: boolean; children?: React.ReactNode }) => {
  const ethereumInfo = useEthereum();
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [notificationInfos, setNotificationInfos] = useState<NotificationInfo[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!ethereumInfo) return;
      if (!rentalityContract) return;

      try {
        const tripServiceContract = await getEtherContractWithSigner("tripService", ethereumInfo.signer);
        if (tripServiceContract == null) {
          console.error("loadNotifications error: tripServiceContract is null");
          return false;
        }

        const eventTripCreatedFilter = isHost
          ? tripServiceContract.filters.TripCreated(null, [ethereumInfo.walletAddress], null)
          : tripServiceContract.filters.TripCreated(null, null, [ethereumInfo.walletAddress]);
        const eventTripCreatedHistory = await tripServiceContract.queryFilter(eventTripCreatedFilter);

        const eventTripStatusChangedFilter = isHost
          ? tripServiceContract.filters.TripStatusChanged(null, null, [ethereumInfo.walletAddress], null)
          : tripServiceContract.filters.TripStatusChanged(null, null, null, [ethereumInfo.walletAddress]);
        const eventTripStatusChangedHistory = await tripServiceContract.queryFilter(eventTripStatusChangedFilter);

        const tripInfos = isHost ? await rentalityContract.getTripsAsHost() : await rentalityContract.getTripsAsGuest();

        // console.log(`eventTripCreatedHistory: ${JSON.stringify(eventTripCreatedHistory, bigIntReplacer)}`);
        // console.log(`eventTripStatusChangedHistory: ${JSON.stringify(eventTripStatusChangedHistory, bigIntReplacer)}`);

        const notifications: NotificationInfo[] = (
          await Promise.all(
            eventTripCreatedHistory
              .filter(isEventLog)
              .map(getNotificationFromCreateTripEvent(tripInfos, isHost))
              .concat(
                eventTripStatusChangedHistory
                  .filter(isEventLog)
                  .map(getNotificationFromTripChangedEvent(tripInfos, isHost))
              )
          )
        )
          .filter(hasValue)
          .sort((a, b) => {
            return b.datestamp.getTime() - a.datestamp.getTime();
          });

        setNotificationInfos(notifications);
      } catch (e) {
        console.error("loadNotifications error:" + e);
      } finally {
        setIsLoading(false);
      }
    };
    loadNotifications();
  }, [ethereumInfo, rentalityContract]);

  const contextValue: NotificationContextInfo = useMemo(() => {
    return { isLoading: isLoading, notifications: notificationInfos };
  }, [isLoading, notificationInfos]);

  return <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>;
};
