import RntButton from "@/components/common/rntButton";
import RntDialogs from "@/components/common/rntDialogs";
import GuestLayout from "@/components/guest/layout/guestLayout";
import PageTitle from "@/components/pageTitle/pageTitle";
import useRntDialogs from "@/hooks/useRntDialogs";
import { TripStatus } from "@/model/TripInfo";
import { dateFormat } from "@/utils/datetimeFormatters";
import { Avatar } from "@mui/material";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

type ChatInfo = {
  tripId: number;

  guestAddress: string;
  guestName: string;
  guestPhotoUrl: string;

  hostAddress: string;
  hostName: string;
  hostPhotoUrl: string;

  tripTitle: string;
  lastMessage: string;

  carPhotoUrl: string;
  tripStatus: TripStatus;
  carTitle: string;
  carLicenceNumber: string;
};

type ChatMesssage = {
  fromAddress: string;
  toAddress: string;
  datestamp: Date;
  message: string;
};

export default function Messages() {
  const [dataFetched, setdataFetched] = useState(true);
  const [dialogState, showInfo, showError, showMessager, hideSnackbar] =
    useRntDialogs();
  const [chats, setChats] = useState<ChatInfo[]>([
    {
      tripId: 1,
      guestAddress: "0x1234",
      guestName: "Alex",
      guestPhotoUrl:
        "https://brilliant-cat-7b398f.netlify.app/_ipx/w_2048,q_75/https%3A%2F%2Fipfs.io%2Fipfs%2FQmb7do1A9rSiqHgEiQVfvydThJB7KMKCYpt1YgdYuJgMdi?url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmb7do1A9rSiqHgEiQVfvydThJB7KMKCYpt1YgdYuJgMdi&w=2048&q=75",

      hostAddress: "0x4321",
      hostName: "Amanda",
      hostPhotoUrl:
        "https://brilliant-cat-7b398f.netlify.app/_ipx/w_2048,q_75/https%3A%2F%2Fipfs.io%2Fipfs%2FQmUMwwqx8kUiRVwmCT81h6THdhRZnvDxgwYC45RZR7nnVr?url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmUMwwqx8kUiRVwmCT81h6THdhRZnvDxgwYC45RZR7nnVr&w=2048&q=75",

      tripTitle:
        "Cancelled trip with Amanda Ford Mustang 2015 and some very very very very very very very very very long text",
      lastMessage:
        "Amazing! First time for our family and some very very very very very very very very very long text",

      carPhotoUrl:
        "https://brilliant-cat-7b398f.netlify.app/_ipx/w_2048,q_75/https%3A%2F%2Fipfs.io%2Fipfs%2FQmbR4mbkBQuNFzWLsPscbYT2J749r9BwvCDFNCg2Sq9t7q?url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmbR4mbkBQuNFzWLsPscbYT2J749r9BwvCDFNCg2Sq9t7q&w=2048&q=75",
      tripStatus: TripStatus.Pending,
      carTitle:
        "Ford Mustang 2015 and some very very very very very very very very very long text",
      carLicenceNumber: "EE 099 TVQ",
    },
    {
      tripId: 2,
      guestAddress: "0x1234",
      guestName: "Alex",
      guestPhotoUrl:
        "https://brilliant-cat-7b398f.netlify.app/_ipx/w_2048,q_75/https%3A%2F%2Fipfs.io%2Fipfs%2FQmb7do1A9rSiqHgEiQVfvydThJB7KMKCYpt1YgdYuJgMdi?url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmb7do1A9rSiqHgEiQVfvydThJB7KMKCYpt1YgdYuJgMdi&w=2048&q=75",

      hostAddress: "0x5678",
      hostName: "Amanda",
      hostPhotoUrl:
        "https://brilliant-cat-7b398f.netlify.app/_ipx/w_2048,q_75/https%3A%2F%2Fipfs.io%2Fipfs%2FQmUMwwqx8kUiRVwmCT81h6THdhRZnvDxgwYC45RZR7nnVr?url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmUMwwqx8kUiRVwmCT81h6THdhRZnvDxgwYC45RZR7nnVr&w=2048&q=75",

      tripTitle:
        "Cancelled trip with Amanda Ford Mustang 2015 and some very very very very very very very very very long text",
      lastMessage:
        "Amazing! First time for our family and some very very very very very very very very very long text",

      carPhotoUrl:
        "https://brilliant-cat-7b398f.netlify.app/_ipx/w_2048,q_75/https%3A%2F%2Fipfs.io%2Fipfs%2FQmbR4mbkBQuNFzWLsPscbYT2J749r9BwvCDFNCg2Sq9t7q?url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmbR4mbkBQuNFzWLsPscbYT2J749r9BwvCDFNCg2Sq9t7q&w=2048&q=75",
      tripStatus: TripStatus.Pending,
      carTitle:
        "Ford Mustang 2015 and some very very very very very very very very very long text",
      carLicenceNumber: "EE 099 TVQ",
    },
    {
      tripId: 3,
      guestAddress: "0x1234",
      guestName: "Alex",
      guestPhotoUrl:
        "https://brilliant-cat-7b398f.netlify.app/_ipx/w_2048,q_75/https%3A%2F%2Fipfs.io%2Fipfs%2FQmb7do1A9rSiqHgEiQVfvydThJB7KMKCYpt1YgdYuJgMdi?url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmb7do1A9rSiqHgEiQVfvydThJB7KMKCYpt1YgdYuJgMdi&w=2048&q=75",

      hostAddress: "0x8765",
      hostName: "Amanda",
      hostPhotoUrl:
        "https://brilliant-cat-7b398f.netlify.app/_ipx/w_2048,q_75/https%3A%2F%2Fipfs.io%2Fipfs%2FQmUMwwqx8kUiRVwmCT81h6THdhRZnvDxgwYC45RZR7nnVr?url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmUMwwqx8kUiRVwmCT81h6THdhRZnvDxgwYC45RZR7nnVr&w=2048&q=75",

      tripTitle:
        "Cancelled trip with Amanda Ford Mustang 2015 and some very very very very very very very very very long text",
      lastMessage:
        "Amazing! First time for our family and some very very very very very very very very very long text",

      carPhotoUrl:
        "https://brilliant-cat-7b398f.netlify.app/_ipx/w_2048,q_75/https%3A%2F%2Fipfs.io%2Fipfs%2FQmbR4mbkBQuNFzWLsPscbYT2J749r9BwvCDFNCg2Sq9t7q?url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmbR4mbkBQuNFzWLsPscbYT2J749r9BwvCDFNCg2Sq9t7q&w=2048&q=75",
      tripStatus: TripStatus.Pending,
      carTitle:
        "Ford Mustang 2015 and some very very very very very very very very very long text",
      carLicenceNumber: "EE 099 TVQ",
    },
    {
      tripId: 4,
      guestAddress: "0x1234",
      guestName: "Alex",
      guestPhotoUrl:
        "https://brilliant-cat-7b398f.netlify.app/_ipx/w_2048,q_75/https%3A%2F%2Fipfs.io%2Fipfs%2FQmb7do1A9rSiqHgEiQVfvydThJB7KMKCYpt1YgdYuJgMdi?url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmb7do1A9rSiqHgEiQVfvydThJB7KMKCYpt1YgdYuJgMdi&w=2048&q=75",

      hostAddress: "0x1470",
      hostName: "Yadira",
      hostPhotoUrl: "",

      tripTitle:
        "Cancelled trip with Yadira Ford Mustang 2015 and some very very very very very very very very very long text",
      lastMessage:
        "Amazing! First time for our family and some very very very very very very very very very long text",

      carPhotoUrl:
        "https://brilliant-cat-7b398f.netlify.app/_ipx/w_2048,q_75/https%3A%2F%2Fipfs.io%2Fipfs%2FQmbR4mbkBQuNFzWLsPscbYT2J749r9BwvCDFNCg2Sq9t7q?url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmbR4mbkBQuNFzWLsPscbYT2J749r9BwvCDFNCg2Sq9t7q&w=2048&q=75",
      tripStatus: TripStatus.Pending,
      carTitle:
        "Ford Mustang 2015 and some very very very very very very very very very long text",
      carLicenceNumber: "EE 099 TVQ",
    },
  ]);
  const [selectedChat, setSelectedChat] = useState<ChatInfo | null>(null);
  const [messages, setMessages] = useState<ChatMesssage[]>([]);

  let statusBgColor = "";
  switch (selectedChat?.tripStatus) {
    case TripStatus.Pending:
      statusBgColor = "bg-yellow-600";
      break;
    case TripStatus.Confirmed:
      statusBgColor = "bg-lime-500";
      break;
    case TripStatus.CheckedInByHost:
      statusBgColor = "bg-blue-600";
      break;
    case TripStatus.Started:
      statusBgColor = "bg-blue-800";
      break;
    case TripStatus.CheckedOutByGuest:
      statusBgColor = "bg-purple-600";
      break;
    case TripStatus.Finished:
      statusBgColor = "bg-purple-800";
      break;
    case TripStatus.Closed:
      statusBgColor = "bg-fuchsia-700";
      break;
    case TripStatus.Rejected:
      statusBgColor = "bg-red-500";
      break;
  }
  const statusClassName = twMerge(
    "absolute right-0 top-2 px-4 py-1 rounded-l-3xl bg-purple-600 text-rnt-temp-status-text text-end text-sm",
    statusBgColor
  );

  const selectChat = (tripId: number) => {
    const item = chats.find((ci) => ci.tripId === tripId) ?? null;
    setSelectedChat(item);
    if (item !== null) {
      createChatMessages(item);
    }
  };
  const characters =
    "ABCDEF GHIJKL MNOPQR STUVW XYZab cdef ghij klmn opqr stuv wxyz 0123 456 789";

  function generateString(length: number) {
    let result = " ";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  const createChatMessages = (chatInfo: ChatInfo) => {
    //Math.random()
    const count = 1 + Math.floor(Math.random() * 19);

    const msgs: ChatMesssage[] = [];

    for (var i = 0; i < count; i++) {
      const isFromHost = Math.floor(Math.random() * 2) === 1;
      msgs[i] = {
        fromAddress: isFromHost ? chatInfo.hostAddress : chatInfo.guestAddress,
        toAddress: isFromHost ? chatInfo.guestAddress : chatInfo.hostAddress,
        datestamp: new Date(),
        message:
          "Great vehicle! Clean, full of fuel, everything functional. " +
          generateString(Math.floor(Math.random() * 300)),
      };
    }
    setMessages(msgs);
  };

  return (
    <GuestLayout>
      <div className="flex flex-col">
        <PageTitle title="Chats" />
        {!dataFetched ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            Loading...
          </div>
        ) : (
          <div className="flex flex-row gap-4 mt-5">
            <div className="w-2/5 flex flex-col gap-2">
              {chats.map((chatInfo) => {
                return (
                  <div
                    key={chatInfo.tripId}
                    className={`rnt-card w-full grid grid-cols-[auto_1fr_auto] gap-x-2 rounded-xl overflow-hidden p-2 ${
                      chatInfo.tripId === selectedChat?.tripId
                        ? "rnt-card-selected"
                        : ""
                    }`}
                    onClick={() => {
                      selectChat(chatInfo.tripId);
                    }}
                  >
                    <div className="w-24 h-24 row-span-3 self-center">
                      <Avatar
                        src={chatInfo.hostPhotoUrl}
                        sx={{ width: "6rem", height: "6rem" }}
                      ></Avatar>
                    </div>
                    <div className="col-span-2 self-end font-bold text-lg">
                      {chatInfo.hostName}
                    </div>
                    <div className="text-sm whitespace-nowrap overflow-hidden overflow-ellipsis">
                      {chatInfo.tripTitle}
                    </div>
                    <div className="text-sm">Trip information</div>
                    <div className="col-span-2 whitespace-nowrap overflow-hidden overflow-ellipsis ">
                      {chatInfo.lastMessage}
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedChat !== null ? (
              <div className="w-3/5 flex flex-col gap-2">
                <div className="font-bold text-2xl">
                  {selectedChat.hostName}
                </div>
                <section className="rnt-card mt-4 rounded-xl flex flex-row overflow-hidden">
                  <div
                    style={{
                      backgroundImage: `url(${selectedChat.carPhotoUrl})`,
                    }}
                    className="relative w-1/4 min-h-[6rem] flex-shrink-0 bg-center bg-cover"
                  >
                    <div className={statusClassName}>
                      <strong className="text-sm">
                        {selectedChat.tripStatus}
                      </strong>
                    </div>
                  </div>
                  <div className="w-3/4 flex flex-col gap-2 justify-center  p-2 pl-8">
                    <div className="text-xl whitespace-nowrap overflow-hidden overflow-ellipsis">
                      {selectedChat.carTitle}
                    </div>
                    <div className="text-sm">
                      {selectedChat.carLicenceNumber}
                    </div>
                  </div>
                </section>

                <div className="my-4 flex flex-col gap-4">
                  {messages.map((msgInfo, index) => {
                    return msgInfo.fromAddress === selectedChat.hostAddress ? (
                      <div
                        key={index}
                        className="rnt-card-selected w-5/6 grid grid-cols-[auto_1fr_auto] gap-2 rounded-xl rounded-ss-none  overflow-hidden p-4"
                      >
                        <div className="w-12 h-12">
                          <Avatar
                            src={selectedChat.hostPhotoUrl}
                            sx={{ width: "3rem", height: "3rem" }}
                          ></Avatar>
                        </div>
                        <div className="font-bold text-lg self-center">
                          {selectedChat.hostName}
                        </div>
                        <div className="text-sm self-center text-gray-600">
                          {dateFormat(msgInfo.datestamp)}
                        </div>
                        <div className="col-span-3 text-sm">
                          {msgInfo.message}
                        </div>
                      </div>
                    ) : (
                      <div
                        key={index}
                        className="rnt-card w-5/6 grid grid-cols-[auto_1fr_auto] gap-2 rounded-xl rounded-se-none overflow-hidden p-4 self-end"
                      >
                        <div className="text-sm self-center text-gray-600">
                          {dateFormat(msgInfo.datestamp)}
                        </div>
                        <div className="font-bold text-lg self-center text-end">
                          {selectedChat.guestName}
                        </div>
                        <div className="w-12 h-12">
                          <Avatar
                            src={selectedChat.guestPhotoUrl}
                            sx={{ width: "3rem", height: "3rem" }}
                          ></Avatar>
                        </div>
                        <div className="col-span-3 text-sm">
                          {msgInfo.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <section className="mb-12">
                  <div className="text-2xl">Send a message</div>
                  <textarea
                    className="w-full px-4 py-2 border-2 rounded-2xl my-2 text-lg"
                    rows={5}
                    id="message"
                    placeholder="Enter your message"
                    // onChange={(e) => {}}
                    // value={""}
                  />
                  <RntButton>Send a message</RntButton>
                </section>
              </div>
            ) : null}
          </div>
        )}
      </div>
      <RntDialogs state={dialogState} hide={hideSnackbar} />
    </GuestLayout>
  );
}
