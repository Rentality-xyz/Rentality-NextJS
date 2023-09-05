import { Contract, BrowserProvider, Wallet } from "ethers";
import { useEffect, useRef, useState } from "react";
import { rentalityJSON } from "../../abis";
import { getTripStatusFromContract } from "@/model/blockchain/ContractTrip";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { ContractChatInfo } from "@/model/blockchain/ContractChatInfo";
import { ChatInfo } from "@/pages/guest/messages";
import { Client as ChatClient } from "@/chat/client.js";

const useChatInfos = (isHost: boolean) => {
  const [dataFetched, setDataFetched] = useState<Boolean>(false);
  const [updateRequired, setUpdateRequired] = useState<Boolean>(true);
  const [chatInfos, setChatInfos] = useState<ChatInfo[]>([]);
  const [chatClient, setChatClient] = useState<ChatClient | undefined>(
    undefined
  );

  const updateData = () => {
    setUpdateRequired(true);
  };

  const getRentalityContract = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error("Ethereum wallet is not found");
      }

      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      return {
        contract: new Contract(
          rentalityJSON.address,
          rentalityJSON.abi,
          signer
        ) as unknown as IRentalityContract,
        signer: signer,
      } as const;
    } catch (e) {
      console.error("getRentalityContract error:" + e);
    }
  };

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
  const isInitiating = useRef(false)

  useEffect(() => {
    const initChat = async () => {
      setDataFetched(false);

      const contractInfo = await getRentalityContract();
      if (contractInfo === undefined) {
        console.error("chat contract info is undefined");
        return;
      }
      const client = new ChatClient(contractInfo.signer, onMessageReceived);
      await client.init();
      await client.listenForChatEncryptionKeys(client.walletAddress);

      const infos = (await getChatInfos(contractInfo.contract)) ?? [];

      infos.forEach(async (ci) => {
        console.log("sending sendRoomKeyRequest...");
        await client.sendRoomKeyRequest(ci.tripId);
      });
      setChatClient(client);
      setChatInfos(infos);

      setDataFetched(true);
    };

    if (isInitiating.current) return;
    isInitiating.current = true;
    console.log("initting chat....");
    initChat();
    isInitiating.current = false;
  }, []);

  // useEffect(() => {
  //   if (chatClient === undefined) return;
  //   if (chatInfos.length === 0) return;

  //   console.log("chatClient or chatInfos changed");

  //   const sendRoomKeyRequests = async () => {
  //     chatInfos.forEach(async (ci) => {
  //       console.log("sending sendRoomKeyRequest");
  //       await chatClient.sendRoomKeyRequest(ci.tripId);
  //     });
  //   };
  //   sendRoomKeyRequests();
  // }, [chatClient, chatInfos]);

  const onMessageReceived = (
    tripId: number,
    message: string,
    fromAddress: string
  ) => {
    console.log(
      `!!! received message for tripId ${tripId} from ${fromAddress}: ${message}`
    );
  };

  const sendMessage = async (tripId: number, message: string) => {
    if (chatClient === undefined) return;

    await chatClient.sendMessage(tripId, message);

    const result = [...chatInfos];
    const selectedChat = result.find((i) => i.tripId === tripId);
    if (selectedChat !== undefined) {
      selectedChat.messages.push({
        datestamp: new Date(),
        fromAddress: isHost
          ? selectedChat.hostAddress
          : selectedChat.guestAddress,
        toAddress: isHost
          ? selectedChat.guestAddress
          : selectedChat.hostAddress,
        message: message,
      });
    }

    setChatInfos(result);
  };

  return [dataFetched, chatInfos, updateData, sendMessage] as const;
};

export default useChatInfos;
