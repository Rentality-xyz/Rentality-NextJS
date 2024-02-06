import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ChatInfo } from "@/model/ChatInfo";
import { Client as ChatClient } from "@/chat/client";
import { getEtherContract } from "@/abis";
import { IRentalityChatHelperContract, IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { ContractChatInfo } from "@/model/blockchain/ContractChatInfo";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { getTripStatusFromContract } from "@/model/blockchain/ContractTrip";
import { getDateFromBlockchainTime } from "@/utils/formInput";
import { useRentality } from "./rentalityContext";
import { isEmpty } from "@/utils/string";
import { bytesToHex } from "viem";
import { useRouter } from "next/router";

export type ChatContextInfo = {
  isLoading: boolean;
  chatInfos: ChatInfo[];
  chatClient: ChatClient | undefined;
  sendMessage: (toAddress: string, tripId: number, message: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextInfo>({
  isLoading: true,
  chatClient: undefined,
  sendMessage: async (toAddress: string, tripId: number, message: string) => {},
  chatInfos: [],
});

export function useChat() {
  return useContext(ChatContext);
}

export const ChatProvider = ({ children }: { children?: React.ReactNode }) => {
  const [chatContextInfo, setChatContextInfo] = useState<ChatContextInfo>({
    isLoading: true,
    chatClient: undefined,
    sendMessage: async (toAddress: string, tripId: number, message: string) => {},
    chatInfos: [],
  });
  const [chatPublicKeys, setChatPublicKeys] = useState<Map<string, string>>(new Map());
  const rentalityInfo = useRentality();
  const router = useRouter();
  const isHost = router.route.startsWith("/host");

  const onUserMessageReceived = async (from: string, to: string, tripId: number, datetime: number, message: string) => {
    setChatContextInfo((current) => {
      const result = { ...current };
      const selectedChat = result.chatInfos.find((i) => i.tripId === tripId);
      if (selectedChat !== undefined) {
        selectedChat.messages.push({
          datestamp: new Date(datetime),
          fromAddress: from,
          toAddress: to,
          message: message,
        });
      }
      return result;
    });
  };

  const sendUserMessage = async (toAddress: string, tripId: number, message: string) => {
    if (chatContextInfo.chatClient === undefined) return;
    const chatPublicKey = chatPublicKeys.get(toAddress);
    if (!chatPublicKey || isEmpty(chatPublicKey)) {
      console.error("sendUserMessage:", `public key for user ${toAddress} is not found`);
      return;
    }

    const datetime = new Date().getTime();

    await chatContextInfo.chatClient.sendUserMessage(toAddress, tripId, datetime, message, chatPublicKey);
  };

  const isInitiating = useRef(false);

  useEffect(() => {
    const getChatInfos = async (rentalityContract: IRentalityContract) => {
      try {
        if (rentalityContract == null) {
          console.error("getChatInfos error: contract is null");
          return;
        }
        const chatInfosView: ContractChatInfo[] = isHost
          ? await rentalityContract.getChatInfoForHost()
          : await rentalityContract.getChatInfoForGuest();
        const chatInfosViewSorted = [...chatInfosView].sort((a, b) => {
          return Number(b.tripId) - Number(a.tripId);
        });

        const chatInfosData =
          chatInfosViewSorted.length === 0
            ? []
            : await Promise.all(
                chatInfosViewSorted.map(async (ci: ContractChatInfo, index) => {
                  const meta = await getMetaDataFromIpfs(ci.carMetadataUrl);
                  const tripStatus = getTripStatusFromContract(Number(ci.tripStatus));

                  let item: ChatInfo = {
                    tripId: Number(ci.tripId),

                    guestAddress: ci.guestAddress,
                    guestName: ci.guestName,
                    guestPhotoUrl: getIpfsURIfromPinata(ci.guestPhotoUrl),

                    hostAddress: ci.hostAddress,
                    hostName: ci.hostName,
                    hostPhotoUrl: getIpfsURIfromPinata(ci.hostPhotoUrl),

                    tripTitle: `${tripStatus} trip with ${ci.hostName} ${ci.carBrand} ${ci.carModel}`,
                    startDateTime: getDateFromBlockchainTime(ci.startDateTime),
                    endDateTime: getDateFromBlockchainTime(ci.endDateTime),
                    lastMessage: "Click to open chat",

                    carPhotoUrl: getIpfsURIfromPinata(meta.image),
                    tripStatus: tripStatus,
                    carTitle: `${ci.carBrand} ${ci.carModel} ${ci.carYearOfProduction}`,
                    carLicenceNumber: meta.attributes?.find((x: any) => x.trait_type === "License plate")?.value ?? "",

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

    const initChat = async () => {
      if (!rentalityInfo) return;
      if (isInitiating.current) return;
      isInitiating.current = true;

      const rentalityChatHelper = (await getEtherContract("chatHelper")) as unknown as IRentalityChatHelperContract;
      if (!rentalityChatHelper) {
        console.error("useChatInfos error: ", "rentalityChatHelper is null");
        return;
      }

      const contractInfo = rentalityInfo.rentalityContract;
      if (contractInfo === undefined) {
        console.error("chat contract info is undefined");
        return;
      }

      console.log("initting chat....");

      setChatContextInfo((prev) => {
        return { ...prev, isLoading: true };
      });

      try {
        const client = new ChatClient();
        const infos = (await getChatInfos(contractInfo)) ?? [];

        const [myStoredPrivateKey, myStoredPublicKey] = await rentalityChatHelper.getMyChatKeys();

        await client.init(rentalityInfo.signer, onUserMessageReceived, myStoredPrivateKey, myStoredPublicKey);
        await client.listenForUserChatMessages();

        if (!client.encryptionKeyPair?.publicKey) {
          console.error("useChatInfos error: ", "publicKey is null");
          return;
        }

        const myPrivateKey = bytesToHex(client.encryptionKeyPair.privateKey);
        const myPublicKey = bytesToHex(client.encryptionKeyPair.publicKey);

        if (isEmpty(myStoredPublicKey) || myStoredPrivateKey !== myPrivateKey || myStoredPublicKey !== myPublicKey) {
          console.log("Saving user chat public key");
          await rentalityChatHelper.setMyChatPublicKey(myPrivateKey, myPublicKey);
        }

        const allAddresses = infos.map((i) => (isHost ? i.guestAddress : i.hostAddress));
        const uniqueAddresses = allAddresses.filter(function (item, pos, self) {
          return self.indexOf(item) == pos;
        });
        const publicKeys = await rentalityChatHelper.getChatPublicKeys(uniqueAddresses);
        var dict = new Map<string, string>();
        publicKeys.forEach((i) => dict.set(i.userAddress, i.publicKey));
        setChatPublicKeys(dict);

        const storedMessages = await client.getUserChatMessages();

        if (storedMessages !== undefined) {
          for (const ci of infos) {
            const msgs = storedMessages.filter((i) => i?.tripId === ci.tripId);
            if (msgs) {
              ci.messages = msgs.map((msgInfo) => {
                return {
                  fromAddress: msgInfo?.from ?? "",
                  toAddress: msgInfo?.to ?? "",
                  datestamp: new Date(msgInfo?.datetime ?? 0),
                  message: msgInfo?.message ?? "",
                };
              });
            }
          }
        }

        setChatContextInfo((prev) => {
          return { ...prev, chatClient: client, chatInfos: infos, sendMessage: sendUserMessage };
        });
      } catch (e) {
        console.error("getChatHelper error:" + e);
      } finally {
        setChatContextInfo((prev) => {
          return { ...prev, isLoading: false };
        });
      }

      isInitiating.current = false;
    };

    initChat();
  }, [rentalityInfo, isHost]);

  return <ChatContext.Provider value={chatContextInfo}>{children}</ChatContext.Provider>;
};
