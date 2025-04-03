import { dateFormatLongMonthDateTime } from "@/utils/datetimeFormatters";
import { Avatar } from "@mui/material";

export default function ChatMessage({
  photoUrl,
  name,
  datetime,
  message,
  isMyMessage,
}: {
  photoUrl: string;
  name: string;
  datetime: Date;
  message: string;
  isMyMessage: boolean;
}) {
  return !isMyMessage ? (
    <div className="rnt-card-selected grid w-5/6 grid-cols-[auto_1fr_auto] gap-2 overflow-hidden rounded-xl rounded-ss-none bg-[#484874] p-4">
      <div className="h-12 w-12">
        <Avatar src={photoUrl} sx={{ width: "3rem", height: "3rem" }}></Avatar>
      </div>
      <div className="self-center text-lg font-bold max-sm:leading-5">{name}</div>
      <div className="self-center text-base text-rentality-secondary">{dateFormatLongMonthDateTime(datetime)}</div>
      <div className="col-span-3 whitespace-pre-line text-lg">{message}</div>
    </div>
  ) : (
    <div className="rnt-card grid w-5/6 grid-cols-[auto_1fr_auto] gap-2 self-end overflow-hidden rounded-xl rounded-se-none bg-[#7856FF] p-4">
      <div className="self-center text-base text-rentality-secondary">{dateFormatLongMonthDateTime(datetime)}</div>
      <div className="self-center text-end text-lg font-bold max-sm:leading-5">{name}</div>
      <div className="h-12 w-12">
        <Avatar src={photoUrl} sx={{ width: "3rem", height: "3rem" }}></Avatar>
      </div>
      <div className="col-span-3 whitespace-pre-line text-lg">{message}</div>
    </div>
  );
}
