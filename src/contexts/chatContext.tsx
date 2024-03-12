import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ChatInfo } from "@/model/ChatInfo";
import { Client as ChatClient } from "@/chat/client";
import { getEtherContractWithSigner } from "@/abis";
import { IRentalityChatHelperContract, IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { getDateFromBlockchainTime } from "@/utils/formInput";
import { useRentality } from "./rentalityContext";
import { isEmpty } from "@/utils/string";
import { bytesToHex } from "viem";
import { useRouter } from "next/router";
import moment from "moment";
import { useEthereum } from "./web3/ethereumContext";
import { ContractChatInfo } from "@/model/blockchain/schemas";
import { getTripStatusFromContract } from "@/model/TripInfo";

export type ChatContextInfo = {
  isLoading: boolean;

  isMyChatKeysSaved: boolean;
  saveMyChatKeys: () => Promise<void>;

  chatInfos: ChatInfo[];
  getLatestChatInfos: () => Promise<void>;
  sendMessage: (toAddress: string, tripId: number, message: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextInfo>({
  isLoading: true,
  isMyChatKeysSaved: false,
  saveMyChatKeys: async () => {},
  chatInfos: [],
  getLatestChatInfos: async () => {},
  sendMessage: async () => {},
});

export function useChat() {
  return useContext(ChatContext);
}

export const ChatProvider = ({ children }: { children?: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMyChatKeysSaved, setIsMyChatKeysSaved] = useState<boolean>(true);
  const [chatPublicKeys, setChatPublicKeys] = useState<Map<string, string>>(new Map());
  const [chatClient, setChatClient] = useState<ChatClient | undefined>(undefined);
  const [chatInfos, setChatInfos] = useState<ChatInfo[]>([]);

  const ethereumInfo = useEthereum();
  const rentalityContract = useRentality();
  const router = useRouter();
  const isHost = router.route.startsWith("/host");

  const onUserMessageReceived = useCallback(
    async (from: string, to: string, tripId: number, datetime: number, message: string) => {
      setChatInfos((current) => {
        const result = [...current];
        const selectedChat = result.find((i) => i.tripId === tripId);
        if (selectedChat !== undefined) {
          selectedChat.messages.push({
            datestamp: moment.unix(datetime).local().toDate(),
            fromAddress: from,
            toAddress: to,
            message: message,
          });
        }
        return result;
      });
    },
    []
  );

  const sendUserMessage = useCallback(
    async (toAddress: string, tripId: number, message: string) => {
      if (!isMyChatKeysSaved) {
        console.error(`sendUserMessage error: you have to save your keys before send messages`);
        return;
      }
      if (chatClient === undefined) {
        console.error("chatClient is undefined");
        return;
      }
      const chatPublicKey = chatPublicKeys.get(toAddress);
      if (!chatPublicKey || isEmpty(chatPublicKey)) {
        console.error("sendUserMessage:", `public key for user ${toAddress} is not found`);
        return;
      }

      const datetime = moment().unix();

      await chatClient.sendUserMessage(toAddress, tripId, datetime, message, chatPublicKey);
    },
    [chatClient, chatPublicKeys, isMyChatKeysSaved]
  );

  const getChatInfos = useCallback(
    async (rentalityContract: IRentalityContract) => {
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
                    timeZoneId: ci.timeZoneId,
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
    },
    [isHost]
  );

  const saveMyChatKeys = useCallback(async () => {
    if (!chatClient) {
      console.error("saveMyChatKeys error: chatClient is null");
      return;
    }
    if (!chatClient.encryptionKeyPair?.publicKey) {
      console.error("saveMyChatKeys error: publicKey is null");
      return;
    }
    if (!ethereumInfo) {
      console.error("saveMyChatKeys error: ethereumInfo is null");
      return;
    }

    const rentalityChatHelper = (await getEtherContractWithSigner(
      "chatHelper",
      ethereumInfo?.signer
    )) as unknown as IRentalityChatHelperContract;
    if (!rentalityChatHelper) {
      console.error("saveMyChatKeys error: ", "rentalityChatHelper is null");
      return;
    }

    const myPrivateKey = bytesToHex(chatClient.encryptionKeyPair.privateKey);
    const myPublicKey = bytesToHex(chatClient.encryptionKeyPair.publicKey);
    try {
      await rentalityChatHelper.setMyChatPublicKey(myPrivateKey, myPublicKey);
    } catch (e) {
      console.error("saveMyChatKeys error:" + e);
    }
  }, [chatClient]);

  const getLatestChatInfos = useCallback(async () => {
    if (!ethereumInfo) return;
    if (!rentalityContract) return;
    if (!chatClient) return;

    const rentalityChatHelper = (await getEtherContractWithSigner(
      "chatHelper",
      ethereumInfo?.signer
    )) as unknown as IRentalityChatHelperContract;
    if (!rentalityChatHelper) {
      console.error("getLatestChatInfos error: rentalityChatHelper is null");
      return;
    }

    setIsLoading(true);

    try {
      const infos = (await getChatInfos(rentalityContract)) ?? [];

      const allAddresses = infos.map((i) => (isHost ? i.guestAddress : i.hostAddress));
      const uniqueAddresses = allAddresses.filter(function (item, pos, self) {
        return self.indexOf(item) == pos;
      });

      const publicKeys = await rentalityChatHelper.getChatPublicKeys(uniqueAddresses);
      var dict = new Map<string, string>();
      publicKeys.forEach((i) => dict.set(i.userAddress, i.publicKey));
      setChatPublicKeys(dict);

      const storedMessages = await chatClient.getUserChatMessages();

      if (storedMessages !== undefined) {
        for (const ci of infos) {
          const msgs = storedMessages.filter((i) => i?.tripId === ci.tripId);
          if (msgs) {
            ci.messages = msgs.map((msgInfo) => {
              return {
                fromAddress: msgInfo?.from ?? "",
                toAddress: msgInfo?.to ?? "",
                datestamp: moment
                  .unix(msgInfo?.datetime ?? 0)
                  .local()
                  .toDate(),
                message: msgInfo?.message ?? "",
              };
            });
          }
        }
      }
      setChatInfos(infos);
    } catch (e) {
      return;
    } finally {
      setIsLoading(false);
    }
  }, [rentalityContract, chatClient, getChatInfos, isHost]);

  const isInitiating = useRef(false);

  useEffect(() => {
    const initChatClient = async () => {
      if (!ethereumInfo) return;
      if (chatClient !== undefined) return;
      if (isInitiating.current) return;
      isInitiating.current = true;

      console.log("initting chat....");

      setIsLoading(true);

      const rentalityChatHelper = (await getEtherContractWithSigner(
        "chatHelper",
        ethereumInfo.signer
      )) as unknown as IRentalityChatHelperContract;
      if (!rentalityChatHelper) {
        console.error("initChatClient error: rentalityChatHelper is null");
        return;
      }

      try {
        const client = new ChatClient();

        const [myStoredPrivateKey, myStoredPublicKey] = await rentalityChatHelper.getMyChatKeys();
        setIsMyChatKeysSaved(!isEmpty(myStoredPrivateKey));

        await client.init(ethereumInfo.signer, onUserMessageReceived, myStoredPrivateKey, myStoredPublicKey);
        await client.listenForUserChatMessages();

        if (!client.encryptionKeyPair?.publicKey) {
          console.error("initChatClient error: publicKey is null");
          return;
        }

        const myPrivateKey = bytesToHex(client.encryptionKeyPair.privateKey);
        const myPublicKey = bytesToHex(client.encryptionKeyPair.publicKey);

        setIsMyChatKeysSaved(
          !isEmpty(myStoredPrivateKey) && myStoredPrivateKey === myPrivateKey && myStoredPublicKey === myPublicKey
        );

        setChatClient(client);
      } catch (e) {
        console.error("initChatClient error:" + e);
      } finally {
        isInitiating.current = false;
      }
    };

    initChatClient();
  }, [ethereumInfo, chatClient, onUserMessageReceived]);

  return (
    <ChatContext.Provider
      value={{
        isLoading: isLoading,
        isMyChatKeysSaved: isMyChatKeysSaved,
        saveMyChatKeys: saveMyChatKeys,
        chatInfos: chatInfos,
        getLatestChatInfos: getLatestChatInfos,
        sendMessage: sendUserMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
