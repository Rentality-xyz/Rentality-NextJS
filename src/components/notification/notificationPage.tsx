import { NotificationInfo } from "@/model/NotificationInfo";
import Notification from "./notification";

export default function NotificationPage({ notifications }: { notifications: NotificationInfo[] }) {
  return (
    <div className="mt-5 flex flex-row gap-4">
      <div className="flex w-full flex-col gap-2 lg:w-full lg:pr-8">
        {notifications.map((notificationInfo, index) => {
          return (
            <Notification
              key={index}
              title={notificationInfo.title}
              datetime={notificationInfo.datestamp}
              message={notificationInfo.message}
            />
          );
        })}
      </div>
    </div>
  );
}
