import { useEffect, useRef, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { NotificationInfo } from "@/model/NotificationInfo";

const useNotificationInfos = (isHost: boolean) => {
  const rentalityInfo = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [notificationInfos, setNotificationInfos] = useState<NotificationInfo[]>([
    {
      title: "Booked",
      datestamp: new Date(),
      message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
    },
    {
      title: "Booked",
      datestamp: new Date(),
      message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
    },
    {
      title: "Booked",
      datestamp: new Date(),
      message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
    },
    {
      title: "Booked",
      datestamp: new Date(),
      message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
    },
    {
      title: "Booked",
      datestamp: new Date(),
      message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
    },
    {
      title: "Booked",
      datestamp: new Date(),
      message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
    },
    {
      title: "Booked",
      datestamp: new Date(),
      message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
    },
    {
      title: "Booked",
      datestamp: new Date(),
      message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
    },
    {
      title: "Booked",
      datestamp: new Date(),
      message: "Ford Mustang 2015 is booked. You have a new unregistered booking, please review it",
    },
  ]);

  // const getChatInfos = async (rentalityContract: IRentalityContract) => {
  //   try {
  //     if (rentalityContract == null) {
  //       console.error("getChatInfos error: contract is null");
  //       return;
  //     }
  //     const chatInfosView: ContractChatInfo[] = isHost
  //       ? await rentalityContract.getChatInfoForHost()
  //       : await rentalityContract.getChatInfoForGuest();

  //     const chatInfosData =
  //       chatInfosView.length === 0
  //         ? []
  //         : await Promise.all(
  //             chatInfosView.map(async (ci: ContractChatInfo, index) => {
  //               const meta = await getMetaDataFromIpfs(ci.carMetadataUrl);
  //               const tripStatus = getTripStatusFromContract(Number(ci.tripStatus));

  //               let item: ChatInfo = {
  //                 tripId: Number(ci.tripId),

  //                 guestAddress: ci.guestAddress,
  //                 guestName: ci.guestName,
  //                 guestPhotoUrl: getIpfsURIfromPinata(ci.guestPhotoUrl),

  //                 hostAddress: ci.hostAddress,
  //                 hostName: ci.hostName,
  //                 hostPhotoUrl: getIpfsURIfromPinata(ci.hostPhotoUrl),

  //                 tripTitle: `${tripStatus} trip with ${ci.hostName} ${ci.carBrand} ${ci.carModel}`,
  //                 dateFrom: new Date(""),
  //                 dateTo: new Date(""),
  //                 lastMessage: "Click to open chat",

  //                 carPhotoUrl: getIpfsURIfromPinata(meta.image),
  //                 tripStatus: tripStatus,
  //                 carTitle: `${ci.carBrand} ${ci.carModel} ${ci.carYearOfProduction}`,
  //                 carLicenceNumber: meta.attributes?.find((x: any) => x.trait_type === "License plate")?.value ?? "",

  //                 messages: [],
  //               };
  //               return item;
  //             })
  //           );

  //     return chatInfosData;
  //   } catch (e) {
  //     console.error("getChatInfos error:" + e);
  //   }
  // };

  const isInitiating = useRef(false);

  useEffect(() => {
    // const initChat = async () => {
    //   if (!rentalityInfo) return;
    //   if (isInitiating.current) return;
    //   isInitiating.current = true;
    //   const contractInfo = rentalityInfo.rentalityContract;
    //   if (contractInfo === undefined) {
    //     console.error("chat contract info is undefined");
    //     return;
    //   }
    //   console.log("initting chat....");
    //   setIsLoading(true);
    //   try {
    //     setChatClient(client);
    //     setChatInfos(infos);
    //   } catch (e) {
    //     console.error("getChatHelper error:" + e);
    //   } finally {
    //     setIsLoading(false);
    //   }
    //   isInitiating.current = false;
    // };
    // initChat();

    setIsLoading(false);
  }, [rentalityInfo]);

  return [isLoading, notificationInfos] as const;
};

export default useNotificationInfos;
