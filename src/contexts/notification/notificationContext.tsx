import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { NotificationInfo, NotificationType } from "@/model/NotificationInfo";

const TEST_DATA = [
  {
    type: NotificationType.Booked,
    title: "Booked",
    datestamp: new Date(),
    message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
  },
  {
    type: NotificationType.Booked,
    title: "Booked",
    datestamp: new Date(),
    message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
  },
  {
    type: NotificationType.Booked,
    title: "Booked",
    datestamp: new Date(),
    message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
  },
  {
    type: NotificationType.Booked,
    title: "Booked",
    datestamp: new Date(),
    message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
  },
  {
    type: NotificationType.Booked,
    title: "Booked",
    datestamp: new Date(),
    message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
  },
  {
    type: NotificationType.Booked,
    title: "Booked",
    datestamp: new Date(),
    message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
  },
  {
    type: NotificationType.Booked,
    title: "Booked",
    datestamp: new Date(),
    message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
  },
  {
    type: NotificationType.Booked,
    title: "Booked",
    datestamp: new Date(),
    message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
  },
  {
    type: NotificationType.Booked,
    title: "Booked",
    datestamp: new Date(),
    message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
  },
];

export type NotificationContextInfo = {
  isLoading: Boolean;
  notifications: NotificationInfo[];
};

const NotificationContext = createContext<NotificationContextInfo>({ isLoading: true, notifications: [] });

export function useNotification() {
  return useContext(NotificationContext);
}

export const NotificationProvider = ({ isHost, children }: { isHost: boolean; children?: React.ReactNode }) => {
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [notificationInfos, setNotificationInfos] = useState<NotificationInfo[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      if (rentalityContract === null) {
        return;
      }
      try {
        //   const myKYCInfo: ContractKYCInfo = await rentalityContract.getMyKYCInfo();
        //   if (myKYCInfo == null) return;
        //   setCurrentUserInfo({
        //     address: ethereumInfo.walletAddress,
        //     firstName: myKYCInfo.name,
        //     lastName: myKYCInfo.surname,
        //     profilePhotoUrl: getIpfsURIfromPinata(myKYCInfo.profilePhoto),
        //     drivingLicense: myKYCInfo.licenseNumber,
        //   });
        setNotificationInfos(TEST_DATA);
      } catch (e) {
        console.error("loadNotifications error:" + e);
      } finally {
        setIsLoading(false);
      }
    };
    loadNotifications();
  }, [rentalityContract]);

  const contextValue: NotificationContextInfo = useMemo(() => {
    return { isLoading: isLoading, notifications: notificationInfos };
  }, [isLoading, notificationInfos]);

  return <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>;
};
