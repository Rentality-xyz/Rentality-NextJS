import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChatInfo } from "@/model/ChatInfo";
import { Client as ChatClient } from "@/chat/client";
import { getEtherContractWithSigner } from "@/abis";
import { IRentalityChatHelperContract, IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { getDateFromBlockchainTime } from "@/utils/formInput";
import { useRentality } from "./rentalityContext";
import { isEmpty } from "@/utils/string";
import { bytesToHex } from "viem";
import moment from "moment";
import { useEthereum } from "./web3/ethereumContext";
import { ContractChatInfo, TripStatus } from "@/model/blockchain/schemas";
import { Contract, Listener } from "ethers";
import { useNotification } from "./notification/notificationContext";
import { NotificationType } from "@/model/NotificationInfo";
import { generateEncryptionKeyPair } from "@/chat/crypto";
import useUserMode from "@/hooks/useUserMode";

export type ChatKeysContextInfo = {
  isLoading: boolean;
  chatKeys: { privateKey: string; publicKey: string } | undefined;
  isChatKeysSaved: boolean;
  saveChatKeys: () => Promise<void>;
};

const ChatKeysContext = createContext<ChatKeysContextInfo>({
  isLoading: true,
  chatKeys: undefined,
  isChatKeysSaved: false,
  saveChatKeys: async () => {},
});

export function useChatKeys() {
  return useContext(ChatKeysContext);
}

export type ChatContextInfo = {
  isLoading: boolean;
  isClienReady: boolean;

  chatInfos: ChatInfo[];
  getLatestChatInfos: () => Promise<void>;
  sendMessage: (toAddress: string, tripId: number, message: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextInfo>({
  isLoading: true,
  isClienReady: false,
  chatInfos: [],
  getLatestChatInfos: async () => {},
  sendMessage: async () => {},
});

export function useChat() {
  return useContext(ChatContext);
}

export const ChatProvider = ({ children }: { children?: React.ReactNode }) => {
  const ethereumInfo = useEthereum();
  const [rentalityChatHelper, setRentalityChatHelper] = useState<IRentalityChatHelperContract | undefined>(undefined);

  useEffect(() => {
    const getRentalityChatHelper = async () => {
      if (!ethereumInfo) return;

      const chatHelper = (await getEtherContractWithSigner(
        "chatHelper",
        ethereumInfo.signer
      )) as unknown as IRentalityChatHelperContract;
      if (!chatHelper) {
        console.error("getChatKeysFromBlockchain error: chatHelper is null");
        return;
      }
      setRentalityChatHelper(chatHelper);
    };

    getRentalityChatHelper();
  }, [ethereumInfo]);

  /// Chat keys
  const [chatKeys, setChatKeys] = useState<{ privateKey: string; publicKey: string } | undefined>(undefined);
  const [isChatKeysLoading, setIsChatKeysLoading] = useState<boolean>(true);
  const [isChatKeysSaved, setIsChatKeysSaved] = useState<boolean>(true);

  const saveChatKeys = useCallback(async () => {
    if (!chatKeys) {
      console.error("saveChatKeys error: chatKeys is undefined");
      return;
    }
    if (!rentalityChatHelper) {
      console.error("saveChatKeys error: rentalityChatHelper is null");
      return;
    }

    try {
      setIsChatKeysLoading(true);

      const transaction = await rentalityChatHelper.setMyChatPublicKey(chatKeys.privateKey, chatKeys.publicKey);
      await transaction.wait();
      setIsChatKeysSaved(true);
    } catch (e) {
      console.error("saveChatKeys error:" + e);
    } finally {
      setIsChatKeysLoading(false);
    }
  }, [rentalityChatHelper, chatKeys]);

  useEffect(() => {
    const getChatKeysFromBlockchain = async () => {
      if (!rentalityChatHelper) return;

      try {
        setIsChatKeysLoading(true);

        const [mySavedPrivateKey, mySavedPublicKey] = await rentalityChatHelper.getMyChatKeys();

        if (isEmpty(mySavedPrivateKey) || isEmpty(mySavedPublicKey)) {
          const { privateKey, publicKey } = generateEncryptionKeyPair();
          setIsChatKeysSaved(false);
          setChatKeys({ privateKey: bytesToHex(privateKey), publicKey: bytesToHex(publicKey) });
        } else {
          setIsChatKeysSaved(true);
          setChatKeys({ privateKey: mySavedPrivateKey, publicKey: mySavedPublicKey });
        }
      } catch (e) {
        console.error("getChatKeysFromBlockchain error:" + e);
      } finally {
        setIsChatKeysLoading(false);
      }
    };

    getChatKeysFromBlockchain();
  }, [rentalityChatHelper]);

  const chatKeysContextInfoValue: ChatKeysContextInfo = useMemo(() => {
    return {
      isLoading: isChatKeysLoading,
      chatKeys: chatKeys,
      isChatKeysSaved: isChatKeysSaved,
      saveChatKeys: saveChatKeys,
    };
  }, [isChatKeysLoading, chatKeys, isChatKeysSaved, saveChatKeys]);

  /// Chat client
  const [chatClient, setChatClient] = useState<ChatClient | undefined>(undefined);
  const [isClientReady, setIsClientReady] = useState<boolean>(false);
  const [chatPublicKeys, setChatPublicKeys] = useState<Map<string, string>>(new Map());
  const { addNotifications } = useNotification();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chatInfos, setChatInfos] = useState<ChatInfo[]>([]);
  const rentalityContract = useRentality();
  const { isHost } = useUserMode();

  const addNotificationsRef = useRef(addNotifications);
  useEffect(() => {
    addNotificationsRef.current = addNotifications;
  }, [addNotifications]);

  const sendUserMessage = useCallback(
    async (toAddress: string, tripId: number, message: string) => {
      if (!isChatKeysSaved) {
        console.error(`sendUserMessage error: you have to save your keys before send messages`);
        return;
      }
      if (!chatClient) {
        console.error("sendUserMessage error: chatClient is undefined");
        return;
      }
      let chatPublicKey = chatPublicKeys.get(toAddress);
      if (!chatPublicKey || isEmpty(chatPublicKey)) {
        if (!rentalityChatHelper) {
          console.error("sendUserMessage error: rentalityChatHelper is undefined");
          return;
        }
        const publicKeys = await rentalityChatHelper.getChatPublicKeys([toAddress]);

        if (!publicKeys || publicKeys.length === 0) {
          console.error("sendUserMessage:", `public key for user ${toAddress} is not found`);
          return;
        }
        chatPublicKey = publicKeys[0].publicKey;

        setChatPublicKeys((prev) => {
          const copy = new Map(prev);
          if (!copy.has(publicKeys[0].userAddress)) {
            copy.set(publicKeys[0].userAddress, publicKeys[0].publicKey);
          }
          return copy;
        });
      }

      const datetime = moment().unix();
      await chatClient.sendUserMessage(
        toAddress,
        tripId,
        datetime,
        "text",
        message,
        new Map<string, string>(),
        chatPublicKey
      );
    },
    [chatClient, chatPublicKeys, isChatKeysSaved, rentalityChatHelper]
  );

  const loadKeysForUsers = useCallback(
    async (addresses: string[]) => {
      if (!rentalityChatHelper) {
        console.error("loadKeysForUsers error: rentalityChatHelper is undefined");
        return;
      }
      const publicKeys = await rentalityChatHelper.getChatPublicKeys(addresses);

      setChatPublicKeys((prev) => {
        let isEdited = false;

        const copy = new Map(prev);
        publicKeys.forEach((i) => {
          if (!copy.has(i.userAddress)) {
            copy.set(i.userAddress, i.publicKey);
            isEdited = true;
          }
        });
        return isEdited ? copy : prev;
      });
    },
    [rentalityChatHelper]
  );

  const isInitiating = useRef(false);

  useEffect(() => {
    const onUserMessageReceived = async (
      from: string,
      to: string,
      tripId: number,
      datetime: number,
      message: string
    ) => {
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

          if (ethereumInfo?.walletAddress === to) {
            const fromUserName =
              from.toLowerCase() === selectedChat.hostAddress.toLowerCase()
                ? selectedChat.hostName
                : selectedChat.guestName;

            console.log(`add message notification`);
            addNotificationsRef.current([
              {
                id: `message_${tripId}_${new Date().getTime()}`,
                type: NotificationType.Message,
                title: "New Message",
                datestamp: new Date(),
                message: `${fromUserName} has sent you a message about their ${selectedChat.carTitle}`,
              },
            ]);
          }
        }
        return result;
      });
    };

    const initChatClient = async () => {
      if (!ethereumInfo) return;
      if (isClientReady) return;
      if (!chatKeys) return;
      if (isInitiating.current) return;

      try {
        console.log("initting chat....");
        isInitiating.current = true;
        setIsLoading(true);

        const client = new ChatClient();
        await client.init(ethereumInfo.signer, onUserMessageReceived, chatKeys.privateKey, chatKeys.publicKey);
        await client.listenForUserChatMessages();

        setChatClient(client);
        setIsClientReady(true);
      } catch (e) {
        console.error("initChatClient error:" + e);
      } finally {
        isInitiating.current = false;
      }
    };

    initChatClient();
  }, [ethereumInfo, isClientReady, chatKeys]);

  /// Chat Infos

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
                chatInfosViewSorted.map(async (ci: ContractChatInfo) => {
                  const meta = await getMetaDataFromIpfs(ci.carMetadataUrl);
                  const tripStatus = ci.tripStatus;

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

  const [rentalityTripService, setRentalityTripService] = useState<Contract | undefined>(undefined);

  useEffect(() => {
    const getRentalityTripService = async () => {
      if (!ethereumInfo) return;

      const tripService = await getEtherContractWithSigner("tripService", ethereumInfo.signer);
      if (!tripService) {
        console.error("getRentalityTripService error: tripService is null");
        return;
      }
      setRentalityTripService(tripService);
    };

    getRentalityTripService();
  }, [ethereumInfo]);

  const tripStatusChangedListener: Listener = useCallback(
    async ({ args }) => {
      if (!rentalityContract) return;

      const tripId = Number(args[0]);
      const tripStatus: TripStatus = BigInt(args[1]);

      setChatInfos((prev) => {
        const result = prev.map((ci) => (ci.tripId === tripId ? { ...ci, tripStatus: tripStatus } : ci));
        return result;
      });
    },
    [rentalityContract]
  );

  const isChatInfoInitialized = useRef(false);

  useEffect(() => {
    const initChatInfos = async () => {
      if (!ethereumInfo) return;
      if (!rentalityContract) return;
      if (!rentalityTripService) return;
      if (!chatClient) return;
      if (isChatInfoInitialized.current) return;

      try {
        setIsLoading(true);

        const infos = (await getChatInfos(rentalityContract)) ?? [];

        const allAddresses = infos.map((i) => (isHost ? i.guestAddress : i.hostAddress));
        const uniqueAddresses = allAddresses.filter(function (item, pos, self) {
          return self.indexOf(item) == pos;
        });

        await loadKeysForUsers(uniqueAddresses);

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

        const eventTripStatusChangedFilter = isHost
          ? rentalityTripService.filters.TripStatusChanged(null, null, [ethereumInfo.walletAddress], null)
          : rentalityTripService.filters.TripStatusChanged(null, null, null, [ethereumInfo.walletAddress]);
        await rentalityTripService.removeAllListeners();
        await rentalityTripService.on(eventTripStatusChangedFilter, tripStatusChangedListener);

        isChatInfoInitialized.current = true;
      } catch (e) {
        return;
      } finally {
        setIsLoading(false);
      }
    };

    initChatInfos();

    return () => {
      if (!rentalityTripService) return;
      rentalityTripService.removeAllListeners();
    };
  }, [
    ethereumInfo,
    rentalityContract,
    rentalityTripService,
    chatClient,
    isHost,
    loadKeysForUsers,
    getChatInfos,
    tripStatusChangedListener,
  ]);

  const getLatestChatInfos = useCallback(async () => {
    if (!rentalityContract) return;
    if (!chatClient) return;

    try {
      setIsLoading(true);

      const infos = (await getChatInfos(rentalityContract)) ?? [];
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

      setChatInfos((prev) => {
        const newInfos = infos.filter((newCi) => prev.find((ci) => ci.tripId === newCi.tripId) === undefined);
        return newInfos.length > 0 ? [...prev, ...newInfos] : prev;
      });
      setChatInfos(infos);
    } catch (e) {
      return;
    } finally {
      setIsLoading(false);
    }
  }, [rentalityContract, chatClient, getChatInfos]);

  return (
    <ChatKeysContext.Provider value={chatKeysContextInfoValue}>
      <ChatContext.Provider
        value={{
          isClienReady: isClientReady,
          isLoading: isLoading,
          chatInfos: chatInfos,
          getLatestChatInfos: getLatestChatInfos,
          sendMessage: sendUserMessage,
        }}
      >
        {children}
      </ChatContext.Provider>
    </ChatKeysContext.Provider>
  );
};
