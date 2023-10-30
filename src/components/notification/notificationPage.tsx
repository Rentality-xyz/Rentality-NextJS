import { NotificationInfo } from "@/model/NotificationInfo";
import Notification from "./notification";

export default function NotificationPage({
  notifications,
}: {
  notifications: NotificationInfo[];
}) {
  return (
    <div className="flex flex-row gap-4 mt-5">
      <div className="w-full lg:w-full flex flex-col gap-2 lg:pr-8">
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
