import { useEffect, useRef, useState } from "react";
import { getTripStatusFromContract } from "@/model/blockchain/ContractTrip";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { ContractChatInfo } from "@/model/blockchain/ContractChatInfo";
import { ChatInfo } from "@/pages/guest/messages";
import { Client as ChatClient } from "@/chat/client";
import { useRentality } from "@/contexts/rentalityContext";

const useChatInfos = (isHost: boolean) => {
  const rentalityInfo = useRentality();
  const [dataFetched, setDataFetched] = useState<Boolean>(false);
  const [chatInfos, setChatInfos] = useState<ChatInfo[]>([]);
  const [chatClient, setChatClient] = useState<ChatClient | undefined>(
    undefined
  );

  const getChatInfos = async (rentalityContract: IRentalityContract) => {
    try {
      if (rentalityContract == null) {
        console.error("getChatInfos error: contract is null");
        return;
      }
      const chatInfosView: ContractChatInfo[] = isHost
        ? await rentalityContract.getChatInfoForHost()
        : await rentalityContract.getChatInfoForGuest();

      const chatInfosData =
        chatInfosView.length === 0
          ? []
          : await Promise.all(
              chatInfosView.map(async (ci: ContractChatInfo, index) => {
                const meta = await getMetaDataFromIpfs(ci.carMetadataUrl);
                const tripStatus = getTripStatusFromContract(
                  Number(ci.tripStatus)
                );

                let item: ChatInfo = {
                  tripId: Number(ci.tripId),

                  guestAddress: ci.guestAddress,
                  guestName: ci.guestName,
                  guestPhotoUrl: getIpfsURIfromPinata(ci.guestPhotoUrl),

                  hostAddress: ci.hostAddress,
                  hostName: ci.hostName,
                  hostPhotoUrl: getIpfsURIfromPinata(ci.hostPhotoUrl),

                  tripTitle: `${tripStatus} trip with ${ci.hostName} ${ci.carBrand} ${ci.carModel}`,
                  lastMessage: "Click to open chat",

                  carPhotoUrl: getIpfsURIfromPinata(meta.image),
                  tripStatus: tripStatus,
                  carTitle: `${ci.carBrand} ${ci.carModel} ${ci.carYearOfProduction}`,
                  carLicenceNumber:
                    meta.attributes?.find(
                      (x: any) => x.trait_type === "License plate"
                    )?.value ?? "",

                  messages: [],
                };
                return item;
              })
            );

      return chatInfosData;
    } catch (e) {
      console.error("getChatInfos error:" + e);
    }
  };

  // useEffect(() => {
  //   if (!updateRequired) return;

  //   setUpdateRequired(false);
  //   setDataFetched(false);

  //   getRentalityContract()
  //     .then((contractInfo) => {
  //       if (contractInfo?.contract !== undefined) {
  //         return getChatInfos(contractInfo.contract);
  //       }
  //     })
  //     .then((data) => {
  //       console.log("setting ChatInfos");
  //       setChatInfos(data ?? []);
  //       setDataFetched(true);
  //     })
  //     .catch(() => setDataFetched(true));
  // }, [updateRequired]);
  const isInitiating = useRef(false);

  useEffect(() => {
    const initChat = async () => {
      if (!rentalityInfo) return;
      if (isInitiating.current) return;
      isInitiating.current = true;
      
      console.log("initting chat....");

      setDataFetched(false);

      const contractInfo = rentalityInfo.rentalityContract;
      if (contractInfo === undefined) {
        console.error("chat contract info is undefined");
        return;
      }
      const client = new ChatClient();
      await client.init(rentalityInfo.signer, onMessageReceived);
      await client.listenForChatEncryptionKeys(await rentalityInfo.signer.getAddress());

      const infos = (await getChatInfos(contractInfo)) ?? [];
      await client.sendRoomKeysRequest(infos.map(i => i.tripId));
      
      for (const ci of infos){
        const storedMessages = await client.getChatMessages(ci.tripId);

        if (storedMessages !== undefined) {
          ci.messages = storedMessages
          .filter(Boolean)
          .map((i) => {
            return {
              fromAddress: i?.sender as string,
              toAddress:  i?.sender.toLowerCase() ===
              ci.guestAddress.toLowerCase()
                ? ci.hostAddress
                : ci.guestAddress,
              datestamp: new Date(),
              message: i?.message as string,
            };
          });
        }
      }

      // console.log("useChatInfos new ChatClient");
      // const client = new ChatClient();
      // console.log("useChatInfos initChat");
      // await client.initChat(contractInfo.signer, onMessageReceived);

      // const infos = (await getChatInfos(contractInfo.contract)) ?? [];

      // console.log("useChatInfos initTrips");
      // await client.initTrips(infos.map(i => i.tripId));

      setChatClient(client);
      setChatInfos(infos);

      setDataFetched(true);
      isInitiating.current = false;
    };

    initChat();
  }, [rentalityInfo]);

  const onMessageReceived = async (
    tripId: number,
    message: string,
    fromAddress: string
  ) => {
    setChatInfos((current) => {
      const result = [...current];
      const selectedChat = result.find((i) => i.tripId === tripId);
      if (selectedChat !== undefined) {
        selectedChat.messages.push({
          datestamp: new Date(),
          fromAddress:
            fromAddress.toLowerCase() ===
            selectedChat.guestAddress.toLowerCase()
              ? selectedChat.guestAddress
              : selectedChat.hostAddress,
          toAddress:
            fromAddress.toLowerCase() ===
            selectedChat.guestAddress.toLowerCase()
              ? selectedChat.hostAddress
              : selectedChat.guestAddress,
          message: message,
        });
      }
      return result;
    });
  };

  const sendMessage = async (tripId: number, message: string) => {
    if (chatClient === undefined) return;

    await chatClient.sendMessage(tripId, message);
  };

  return [dataFetched, chatInfos, sendMessage, setChatInfos] as const;
};

export default useChatInfos;
