import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ChatInfo } from "@/model/ChatInfo";
import { getEtherContractWithSigner } from "@/abis";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { getIpfsURI, getMetaDataFromIpfs, parseMetaData } from "@/utils/ipfsUtils";
import { getDateFromBlockchainTime } from "@/utils/formInput";
import { useRentality } from "../../rentalityContext";
import { isEmpty } from "@/utils/string";
import moment from "moment";
import { useEthereum } from "../../web3/ethereumContext";
import { ContractChatInfo, ContractTripDTO, EventType, TripStatus } from "@/model/blockchain/schemas";
import { Contract, Listener } from "ethers";
import { useNotification } from "../../notification/notificationContext";
import useUserMode, { isHost } from "@/hooks/useUserMode";
import { Unsubscribe, doc, onSnapshot } from "firebase/firestore";
import { chatDbInfo } from "@/utils/firebase";
import {
  ChatId,
  FirebaseUserChat,
  checkUserChats,
  getChatMessages,
  markUserChatAsSeen,
  saveMessageToFirebase,
} from "@/chat/model/chatFirebaseTypes";
import { ChatMessage } from "@/model/ChatMessage";
import { useAuth } from "@/contexts/auth/authContext";

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
  isLoadingClient: boolean;
  chatInfos: ChatInfo[];
  updateAllChats: () => void;
  sendMessage: (toAddress: string, tripId: number, message: string, tag?: string) => Promise<void>;

  isLoadingChat: boolean;
  selectChat: (tripId: number) => void;
  getMessages: (tripId: number) => Promise<ChatMessage[]>;
};

const FirebaseChatContext = createContext<ChatContextInfo>({
  isLoadingClient: true,
  chatInfos: [],
  updateAllChats: () => {},
  sendMessage: async () => {},

  isLoadingChat: true,
  selectChat: async () => {},
  getMessages: async () => {
    return [];
  },
});

export function useChat() {
  return useContext(FirebaseChatContext);
}

export const FirebaseChatProvider = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const ethereumInfo = useEthereum();

  /// Chat client
  const rentalityContract = useRentality();
  const { userMode } = useUserMode();

  const [isChatReloadRequire, setIsChatReloadRequire] = useState(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chatInfos, setChatInfos] = useState<ChatInfo[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatInfo | undefined>(undefined);

  const { addNotifications } = useNotification();
  const addNotificationsRef = useRef(addNotifications);
  useEffect(() => {
    addNotificationsRef.current = addNotifications;
  }, [addNotifications]);

  const sendUserMessage = useCallback(
    async (toAddress: string, tripId: number, message: string, tag: string = "TEXT") => {
      if (isEmpty(message)) return;
      if (!ethereumInfo) return;
      if (!chatDbInfo.db) return;

      const chatInfo = chatInfos.find((ci) => ci.tripId === tripId);
      if (!chatInfo) return;

      const chatId = new ChatId(
        ethereumInfo.chainId.toString(),
        tripId.toString(),
        chatInfo.hostAddress,
        chatInfo.guestAddress
      );
      const newMessage = {
        chatId: chatId,
        senderId: ethereumInfo.walletAddress,
        text: message,
        tag: tag,
        createdAt: moment().unix(),
      };

      await saveMessageToFirebase(chatDbInfo, newMessage);
    },
    [chatInfos, ethereumInfo]
  );

  /// Chat Infos

  const getChatInfosWithoutMessages = useCallback(
    async (rentalityContract: IRentalityContract) => {
      try {
        if (rentalityContract == null) {
          console.error("getChatInfos error: contract is null");
          return;
        }

        const chatInfosView: ContractChatInfo[] = await rentalityContract.getChatInfoFor(isHost(userMode));
        const chatInfosViewSorted = [...chatInfosView].sort((a, b) => {
          return Number(b.tripId) - Number(a.tripId);
        });

        const chatInfosData =
          chatInfosViewSorted.length === 0
            ? []
            : await Promise.all(
                chatInfosViewSorted.map(async (ci: ContractChatInfo) => {
                  const metaData = parseMetaData(await getMetaDataFromIpfs(ci.carMetadataUrl));
                  const tripStatus = ci.tripStatus;

                  let item: ChatInfo = {
                    tripId: Number(ci.tripId),

                    guestAddress: ci.guestAddress,
                    guestName: ci.guestName,
                    guestPhotoUrl: getIpfsURI(ci.guestPhotoUrl),

                    hostAddress: ci.hostAddress,
                    hostName: ci.hostName,
                    hostPhotoUrl: getIpfsURI(ci.hostPhotoUrl),

                    tripTitle: `${tripStatus} trip with ${ci.hostName} ${ci.carBrand} ${ci.carModel}`,
                    startDateTime: getDateFromBlockchainTime(ci.startDateTime),
                    endDateTime: getDateFromBlockchainTime(ci.endDateTime),
                    timeZoneId: ci.timeZoneId,
                    lastMessage: "Click to open chat",
                    updatedAt: moment.unix(0).toDate(),
                    isSeen: true,
                    seenAt: null,

                    carPhotoUrl: getIpfsURI(metaData.mainImage),
                    tripStatus: tripStatus,
                    carTitle: `${ci.carBrand} ${ci.carModel} ${ci.carYearOfProduction}`,
                    carLicenceNumber: metaData.licensePlate,

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
    [userMode]
  );

  const [rentalityNotificationService, setRentalityNotificationService] = useState<Contract | undefined>(undefined);

  useEffect(() => {
    const getRentalityNotificationService = async () => {
      if (!ethereumInfo) return;

      const notificationService = await getEtherContractWithSigner("notificationService", ethereumInfo.signer);
      if (!notificationService) {
        console.error("getRentalityNotificationService error: notificationService is null");
        return;
      }
      setRentalityNotificationService(notificationService);
    };

    getRentalityNotificationService();
  }, [ethereumInfo]);

  const rentalityEventListener: Listener = useCallback(
    async ({ args }) => {
      if (!rentalityContract) return;

      const eventType = BigInt(args[0]);
      if (eventType !== EventType.Trip) {
        return;
      }

      const tripId = Number(args[1]);
      const tripStatus: TripStatus = BigInt(args[2]);

      console.debug(`tripStatusChangedListener call. TripId: ${tripId} status: ${tripStatus}`);
      if (tripStatus === TripStatus.Pending) {
        try {
          const tripInfo: ContractTripDTO = await rentalityContract.getTrip(BigInt(tripId));
          const metaData = parseMetaData(await getMetaDataFromIpfs(tripInfo.metadataURI));
          const tripStatus = tripInfo.trip.status;

          setChatInfos((prev) => {
            if (prev.find((ci) => ci.tripId === Number(tripId)) !== undefined) {
              return prev;
            }

            return [
              ...prev,
              {
                tripId: Number(tripInfo.trip.tripId),

                guestAddress: tripInfo.trip.guest,
                guestName: tripInfo.trip.guestName,
                guestPhotoUrl: getIpfsURI(tripInfo.guestPhotoUrl),

                hostAddress: tripInfo.trip.host,
                hostName: tripInfo.trip.hostName,
                hostPhotoUrl: getIpfsURI(tripInfo.hostPhotoUrl),

                tripTitle: `${tripStatus} trip with ${tripInfo.trip.hostName} ${tripInfo.brand} ${tripInfo.model}`,
                startDateTime: getDateFromBlockchainTime(tripInfo.trip.startDateTime),
                endDateTime: getDateFromBlockchainTime(tripInfo.trip.endDateTime),
                timeZoneId: tripInfo.timeZoneId,
                lastMessage: "Click to open chat",
                updatedAt: moment.unix(0).toDate(),
                isSeen: true,
                seenAt: null,

                carPhotoUrl: getIpfsURI(metaData.mainImage),
                tripStatus: tripStatus,
                carTitle: `${tripInfo.brand} ${tripInfo.model} ${tripInfo.yearOfProduction}`,
                carLicenceNumber: metaData.licensePlate,

                messages: [],
              },
            ];
          });
        } catch (e) {
          console.error("rentalityEventListener error:" + e);
        }
      } else {
        setChatInfos((prev) => {
          const result = prev.map((ci) => (ci.tripId === tripId ? { ...ci, tripStatus: tripStatus } : ci));
          return result;
        });
      }
    },
    [rentalityContract]
  );

  const selectChat = useCallback(
    (tripId: number) => {
      if (selectedChat?.tripId === tripId) return;
      if (chatInfos.length === 0) return;

      const existChatInfo = chatInfos.find((ci) => ci.tripId === tripId);

      if (!existChatInfo) {
        console.error(`Chat with tripId ${tripId} is not found`);
        return;
      }
      setSelectedChat(existChatInfo);
    },
    [chatInfos, selectedChat]
  );

  const getMessages = useCallback(
    async (tripId: number) => {
      if (!ethereumInfo) return [];
      if (!chatDbInfo.db) return [];

      const existChatInfo = chatInfos.find((ci) => ci.tripId === tripId);

      if (!existChatInfo) {
        console.error(`Chat with tripId ${tripId} is not found`);
        return [];
      }

      const chatId = new ChatId(
        ethereumInfo.chainId.toString(),
        tripId.toString(),
        existChatInfo.hostAddress,
        existChatInfo.guestAddress
      );

      const firebaseMessages = await getChatMessages(chatDbInfo, chatId);
      return firebaseMessages.map((cm) => {
        return {
          fromAddress: cm.senderId,
          toAddress:
            cm.senderId.toLowerCase() === existChatInfo.hostAddress.toLowerCase()
              ? existChatInfo.guestAddress
              : existChatInfo.hostAddress,
          datestamp: moment.unix(cm.createdAt).toDate(),
          message: cm.text,
        } as ChatMessage;
      });
    },
    [chatInfos, ethereumInfo]
  );

  useEffect(() => {
    if (selectedChat === undefined) return;
    if (!ethereumInfo) return;
    if (!chatDbInfo.db) return;

    const chatId = new ChatId(
      ethereumInfo.chainId.toString(),
      selectedChat.tripId.toString(),
      selectedChat.hostAddress,
      selectedChat.guestAddress
    );

    markUserChatAsSeen(chatDbInfo, ethereumInfo.walletAddress, chatId);

    const chatsRef = doc(chatDbInfo.db, chatDbInfo.collections.chats, chatId.toString());
    console.debug(`Sub for chat ${chatId.toString()}`);
    const unSub = onSnapshot(chatsRef, (res) => {
      const data = res.data();
      if (!data) return;

      const newMessages = data.messages.map(
        (cm: { chatId: string; senderId: string; text: string; tag: string; createdAt: number }) => {
          return {
            fromAddress: cm.senderId,
            toAddress:
              cm.senderId.toLowerCase() === selectedChat.hostAddress.toLowerCase()
                ? selectedChat.guestAddress
                : selectedChat.hostAddress,
            datestamp: moment.unix(cm.createdAt).toDate(),
            message: cm.text,
          };
        }
      );
      setChatInfos((prev) =>
        prev.map((ci) => {
          return ci.tripId !== selectedChat.tripId
            ? ci
            : {
                ...ci,
                messages: newMessages,
                updatedAt:
                  ci.updatedAt !== moment.unix(0).toDate() || newMessages[-1] === undefined
                    ? ci.updatedAt
                    : newMessages[-1].datestamp,
              };
        })
      );
    });

    return () => {
      if (unSub) {
        console.debug(`Unsub from chat ${chatId.toString()}`);

        unSub();
      }
    };
  }, [ethereumInfo, selectedChat]);

  const isChatInitializing = useRef(false);

  useEffect(() => {
    let unSub: Unsubscribe;

    const initChatInfos = async () => {
      if (!isChatReloadRequire) return;
      if (!ethereumInfo) return;
      if (!rentalityContract) return;
      if (!rentalityNotificationService) return;
      if (!chatDbInfo.db) return;
      if (isChatInitializing.current) return;

      try {
        isChatInitializing.current = true;
        setIsLoading(true);
        console.log(`Chat initializing...`);

        const infos = (await getChatInfosWithoutMessages(rentalityContract)) ?? [];

        const promisses = infos.map(async (i) => {
          await checkUserChats(chatDbInfo, i.hostAddress, i.guestAddress);

          const chatId = new ChatId(
            ethereumInfo.chainId.toString(),
            i.tripId.toString(),
            i.hostAddress,
            i.guestAddress
          );

          const firebaseMessages = await getChatMessages(chatDbInfo, chatId);
          const messages: ChatMessage[] = firebaseMessages.map((cm) => {
            return {
              fromAddress: cm.senderId,
              toAddress: cm.senderId.toLowerCase() === i.hostAddress.toLowerCase() ? i.guestAddress : i.hostAddress,
              datestamp: moment.unix(cm.createdAt).toDate(),
              message: cm.text,
            };
          });

          return { ...i, messages: messages } as ChatInfo;
        });

        const chatInfos = await Promise.all(promisses);
        setChatInfos(chatInfos);

        const rentalityEventFilterFromUser = rentalityNotificationService.filters.RentalityEvent(
          null,
          null,
          null,
          [ethereumInfo.walletAddress],
          null,
          null
        );
        const rentalityEventFilterToUser = rentalityNotificationService.filters.RentalityEvent(
          null,
          null,
          null,
          null,
          [ethereumInfo.walletAddress],
          null
        );

        await rentalityNotificationService.removeAllListeners();
        await rentalityNotificationService.on(rentalityEventFilterFromUser, rentalityEventListener);
        await rentalityNotificationService.on(rentalityEventFilterToUser, rentalityEventListener);
        setIsChatReloadRequire(false);

        const chatsRef = doc(chatDbInfo.db, chatDbInfo.collections.userchats, ethereumInfo.walletAddress);

        console.debug("Sub for userchats");
        unSub = onSnapshot(chatsRef, (res) => {
          const data = res.data();
          if (!data) return;
          const userChats: FirebaseUserChat[] = data.userChats.map(
            (cm: {
              chatId: string;
              senderId: string;
              lastMessages: string;
              updatedAt: number;
              isSeen: boolean;
              seenAt?: number;
            }) => {
              return { ...cm, chatId: ChatId.parse(cm.chatId) } as FirebaseUserChat;
            }
          );

          setChatInfos((prev) =>
            prev.map((ci) => {
              const chatId = new ChatId(
                ethereumInfo.chainId.toString(),
                ci.tripId.toString(),
                ci.hostAddress,
                ci.guestAddress
              );
              const existUserChat = userChats.find((uc) => uc.chatId.toString() === chatId.toString());

              if (!existUserChat) return ci;

              return {
                ...ci,
                lastMessage: existUserChat.lastMessages,
                updatedAt: moment.unix(existUserChat.updatedAt).toDate(),
                isSeen: existUserChat.isSeen,
                seenAt: existUserChat.seenAt ? moment.unix(existUserChat.seenAt).toDate() : null,
              };
            })
          );
        });

        console.log(`Chat initialized!`);
      } catch (e) {
        console.error("initChatInfos error:", e);
        return;
      } finally {
        isChatInitializing.current = false;
        setIsLoading(false);
      }
    };

    initChatInfos();

    return () => {
      if (!isChatReloadRequire) return;
      if (!ethereumInfo) return;
      if (!rentalityContract) return;
      if (!rentalityNotificationService) return;
      if (!chatDbInfo.db) return;
      if (isChatInitializing.current) return;

      if (rentalityNotificationService) {
        rentalityNotificationService.removeAllListeners();
      }
      if (unSub) {
        console.debug("unSub for userchats");
        unSub();
      }
    };
  }, [
    ethereumInfo,
    rentalityContract,
    rentalityNotificationService,
    userMode,
    getChatInfosWithoutMessages,
    rentalityEventListener,
    isChatReloadRequire,
  ]);

  useEffect(() => {
    if (!isAuthenticated && chatInfos.length > 0) {
      console.debug(`User has logged out. Reset chatInfos`);
      setChatInfos([]);
    }
  }, [isAuthenticated, chatInfos]);

  function updateAllChats() {
    setIsChatReloadRequire(true);
  }

  return (
    <ChatKeysContext.Provider
      value={{
        isLoading: false,
        chatKeys: undefined,
        isChatKeysSaved: true,
        saveChatKeys: async () => {},
      }}
    >
      <FirebaseChatContext.Provider
        value={{
          isLoadingClient: false,
          chatInfos: chatInfos,
          updateAllChats: updateAllChats,
          sendMessage: sendUserMessage,

          isLoadingChat: false,
          selectChat: selectChat,
          getMessages: getMessages,
        }}
      >
        {children}
      </FirebaseChatContext.Provider>
    </ChatKeysContext.Provider>
  );
};
