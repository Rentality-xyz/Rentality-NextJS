import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChatInfo } from "@/model/ChatInfo";
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
import { generateEncryptionKeyPair } from "@/chat/crypto";
import useUserMode from "@/hooks/useUserMode";
import {
  Unsubscribe,
  arrayUnion,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { dbPromise } from "@/utils/firebase";
import { ChatId, FIREBASE_DB_NAME } from "@/chat/model/firebase";
import { ChatMessage } from "@/model/ChatMessage";
import { bigIntReplacer } from "@/utils/json";

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
  isChatReady: boolean;

  chatInfos: ChatInfo[];
  getLatestChatInfos: () => Promise<void>;
  sendMessage: (toAddress: string, tripId: number, message: string) => Promise<void>;
};

const FirebaseChatContext = createContext<ChatContextInfo>({
  isLoading: true,
  isChatReady: true,
  chatInfos: [],
  getLatestChatInfos: async () => {},
  sendMessage: async () => {},
});

export function useChat() {
  return useContext(FirebaseChatContext);
}

export const FirebaseChatProvider = ({ children }: { children?: React.ReactNode }) => {
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
      if (isEmpty(message)) return;

      if (!isChatKeysSaved) {
        console.error(`sendUserMessage error: you have to save your keys before send messages`);
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

      if (!ethereumInfo) return;
      const db = await dbPromise;
      if (!db) return;

      const chatInfo = chatInfos.find((ci) => ci.tripId === tripId);
      if (!chatInfo) return;

      const chatId = new ChatId(
        ethereumInfo.chainId.toString(),
        tripId.toString(),
        chatInfo.hostAddress,
        chatInfo.guestAddress
      );

      const chatsRef = collection(db, FIREBASE_DB_NAME.chats);
      const chatsQuerySnapshot = await getDocs(query(chatsRef, where("chatId", "==", chatId.toString())));
      const newMessage = {
        chatId: chatId.toString(),
        senderId: ethereumInfo.walletAddress,
        text: message,
        tag: "TEXT",
        createdAt: moment().unix(),
      };
      if (chatsQuerySnapshot.empty) {
        await setDoc(doc(chatsRef, chatId.toString()), {
          chatId: chatId.toString(),
          createdAt: moment().unix(),
          messages: [newMessage],
        });
      } else {
        await updateDoc(doc(chatsRef, chatId.toString()), {
          messages: arrayUnion(newMessage),
        });
      }

      // await chatClient.sendUserMessage(
      //   toAddress,
      //   tripId,
      //   datetime,
      //   "text",
      //   message,
      //   new Map<string, string>(),
      //   chatPublicKey
      // );
    },
    [chatPublicKeys, chatInfos, ethereumInfo, isChatKeysSaved, rentalityChatHelper]
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
    const unsubscribeList: Unsubscribe[] = [];

    const initChatInfos = async () => {
      if (!ethereumInfo) return;
      if (!rentalityContract) return;
      if (!rentalityTripService) return;
      if (isChatInfoInitialized.current) return;
      const db = await dbPromise;
      if (!db) {
        console.error(`db is null`);
        return;
      }

      try {
        setIsLoading(true);

        const infos = (await getChatInfos(rentalityContract)) ?? [];

        const allAddresses = infos.map((i) => (isHost ? i.guestAddress : i.hostAddress));
        const uniqueAddresses = allAddresses.filter(function (item, pos, self) {
          return self.indexOf(item) == pos;
        });

        await loadKeysForUsers(uniqueAddresses);

        const chatsRef = collection(db, FIREBASE_DB_NAME.chats);

        const promisses = infos.map(async (i) => {
          const chatId = new ChatId(
            ethereumInfo.chainId.toString(),
            i.tripId.toString(),
            i.hostAddress,
            i.guestAddress
          );

          let messages: ChatMessage[] = [];
          const chatsQuerySnapshot = await getDocs(query(chatsRef, where("chatId", "==", chatId.toString())));
          if (!chatsQuerySnapshot.empty) {
            const chatsQueryData = chatsQuerySnapshot.docs[0].data();
            const chatMessages = chatsQueryData.messages;
            messages = chatMessages.map(
              (cm: { chatId: string; senderId: string; text: string; tag: string; createdAt: number }) => {
                return {
                  fromAddress: cm.senderId,
                  toAddress: cm.senderId.toLowerCase() === i.hostAddress.toLowerCase() ? i.guestAddress : i.hostAddress,
                  datestamp: moment.unix(cm.createdAt),
                  message: cm.text,
                };
              }
            );
          }

          const unSub = onSnapshot(doc(chatsRef, chatId.toString()), (res) => {
            const data = res.data();
            if (!data) return;
            const newMessages = data.messages.map(
              (cm: { chatId: string; senderId: string; text: string; tag: string; createdAt: number }) => {
                return {
                  fromAddress: cm.senderId,
                  toAddress: cm.senderId.toLowerCase() === i.hostAddress.toLowerCase() ? i.guestAddress : i.hostAddress,
                  datestamp: moment.unix(cm.createdAt),
                  message: cm.text,
                };
              }
            );
            setChatInfos((prev) =>
              prev.map((ci) => {
                return ci.tripId !== i.tripId ? ci : { ...ci, messages: newMessages };
              })
            );
          });
          unsubscribeList.push(unSub);
          return { ...i, messages: messages } as ChatInfo;
        });

        const chatInfos = await Promise.all(promisses);
        setChatInfos(chatInfos);

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
      if (rentalityTripService) {
        rentalityTripService.removeAllListeners();
      }
      if (unsubscribeList.length > 0) {
        unsubscribeList.forEach((unSub) => unSub());
      }
    };
  }, [
    ethereumInfo,
    rentalityContract,
    rentalityTripService,
    isHost,
    loadKeysForUsers,
    getChatInfos,
    tripStatusChangedListener,
  ]);

  const getLatestChatInfos = useCallback(async () => {
    if (!rentalityContract) return;
    if (!ethereumInfo) return;
    const db = await dbPromise;
    if (!db) {
      console.error(`db is null`);
      return;
    }

    try {
      setIsLoading(true);

      const infos = (await getChatInfos(rentalityContract)) ?? [];

      const chatsRef = collection(db, FIREBASE_DB_NAME.chats);

      const promisses = infos.map(async (i) => {
        const chatId = new ChatId(ethereumInfo.chainId.toString(), i.tripId.toString(), i.hostAddress, i.guestAddress);

        let messages: ChatMessage[] = [];
        const chatsQuerySnapshot = await getDocs(query(chatsRef, where("chatId", "==", chatId.toString())));
        if (!chatsQuerySnapshot.empty) {
          const chatsQueryData = chatsQuerySnapshot.docs[0].data();
          const chatMessages = chatsQueryData.messages;
          messages = chatMessages.map(
            (cm: { chatId: string; senderId: string; text: string; tag: string; createdAt: Date }) => {
              return {
                fromAddress: cm.senderId,
                toAddress: cm.senderId.toLowerCase() === i.hostAddress.toLowerCase() ? i.guestAddress : i.hostAddress,
                datestamp: cm.createdAt,
                message: cm.text,
              };
            }
          );
        }
        return { ...i, messages: messages };
      });

      const infosWithMessages = await Promise.all(promisses);
      setChatInfos((prev) => {
        const newInfos = infosWithMessages.filter(
          (newCi) => prev.find((ci) => ci.tripId === newCi.tripId) === undefined
        );
        return newInfos.length > 0 ? [...prev, ...newInfos] : prev;
      });
      //setChatInfos(infos);
    } finally {
      setIsLoading(false);
    }
  }, [rentalityContract, ethereumInfo, getChatInfos]);

  return (
    <ChatKeysContext.Provider value={chatKeysContextInfoValue}>
      <FirebaseChatContext.Provider
        value={{
          isLoading: isLoading,
          isChatReady: true,
          chatInfos: chatInfos,
          getLatestChatInfos: getLatestChatInfos,
          sendMessage: sendUserMessage,
        }}
      >
        {children}
      </FirebaseChatContext.Provider>
    </ChatKeysContext.Provider>
  );
};
