import { useEffect, useRef, useState } from "react";
import { getTripStatusFromContract } from "@/model/blockchain/ContractTrip";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { ContractChatInfo } from "@/model/blockchain/ContractChatInfo";
import { Client as ChatClient } from "@/chat/client";
import { useRentality } from "@/contexts/rentalityContext";
import { Contract, ethers } from "ethers";
import { rentalityChatHelperJSON } from "@/abis";
import { IRentalityChatHelperContract } from "@/model/blockchain/IRentalityChatHelperContract";
import { isEmpty } from "@/utils/string";
import { bytesToHex } from "@waku/utils/bytes";
import { ChatInfo } from "@/model/ChatInfo";

const useChatInfos = (isHost: boolean) => {
  const rentalityInfo = useRentality();
  const [dataFetched, setDataFetched] = useState<Boolean>(false);
  const [chatInfos, setChatInfos] = useState<ChatInfo[]>([]);
  const [chatClient, setChatClient] = useState<ChatClient | undefined>(undefined);
  const [chatPublicKeys, setChatPublicKeys] = useState<Map<string, string>>(new Map());

  const getChatInfos = async (rentalityContract: IRentalityContract) => {
    try {
      if (rentalityContract == null) {
        console.error("getChatInfos error: contract is null");
        return;
      }
      const chatInfosView: ContractChatInfo[] = (
        isHost ? await rentalityContract.getChatInfoForHost() : await rentalityContract.getChatInfoForGuest()
      ).sort((a, b) => {
        return Number(b.tripId) - Number(a.tripId);
      });

      const chatInfosData =
        chatInfosView.length === 0
          ? []
          : await Promise.all(
              chatInfosView.map(async (ci: ContractChatInfo, index) => {
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

  const getChatHelper = async () => {
    if (window.ethereum == null) {
      console.error("Ethereum wallet is not found");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const rentalityChatHelperContract = new Contract(
        rentalityChatHelperJSON.address,
        rentalityChatHelperJSON.abi,
        signer
      ) as unknown as IRentalityChatHelperContract;

      return rentalityChatHelperContract;
    } catch (e) {
      console.error("getChatHelper error:" + e);
    }
  };

  const isInitiating = useRef(false);

  useEffect(() => {
    const initChat = async () => {
      if (!rentalityInfo) return;
      if (isInitiating.current) return;
      isInitiating.current = true;

      const rentalityChatHelper = await getChatHelper();
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

      setDataFetched(false);

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
        console.log("publicKeys: ", dict);

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

        setChatClient(client);
        setChatInfos(infos);
      } catch (e) {
        console.error("getChatHelper error:" + e);
      } finally {
        setDataFetched(true);
      }

      isInitiating.current = false;
    };

    initChat();
  }, [rentalityInfo]);

  const onUserMessageReceived = async (from: string, to: string, tripId: number, datetime: number, message: string) => {
    setChatInfos((current) => {
      const result = [...current];
      const selectedChat = result.find((i) => i.tripId === tripId);
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
    if (chatClient === undefined) return;
    const chatPublicKey = chatPublicKeys.get(toAddress);
    if (!chatPublicKey || isEmpty(chatPublicKey)) {
      console.error("sendUserMessage:", `public key for user ${toAddress} is not found`);
      return;
    }

    const datetime = new Date().getTime();

    await chatClient.sendUserMessage(toAddress, tripId, datetime, message, chatPublicKey);
  };

  return [dataFetched, chatInfos, sendUserMessage, setChatInfos] as const;
};

export default useChatInfos;
