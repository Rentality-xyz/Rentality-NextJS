import { dateFormatLongMonthDateTime } from "@/utils/datetimeFormatters";

export default function Notification({ title, datetime, message }: { title: string; datetime: Date; message: string }) {
  return (
    <div className="rnt-card flex w-full flex-col gap-2 overflow-hidden rounded-xl bg-rentality-bg p-4">
      <div className="flex flex-row justify-between">
        <div className="text-lg font-bold text-rentality-secondary">{title}</div>
        <div className="text-sm text-gray-200">{dateFormatLongMonthDateTime(datetime)}</div>
      </div>
      <div className="text-gray-200">{message}</div>
    </div>
  );
}
