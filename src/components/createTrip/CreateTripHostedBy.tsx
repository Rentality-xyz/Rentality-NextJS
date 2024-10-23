import { Avatar } from "@mui/material";
import { useTranslation } from "react-i18next";

export function CreateTripHostedBy({
  hostPhotoUrl,
  hostName,
  hostAddress,
}: {
  hostPhotoUrl: string;
  hostName: string;
  hostAddress: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-row items-center gap-2">
      <div className="bg-rentality-bg p-2">
        <div className="h-16 w-16 self-center">
          <Avatar src={hostPhotoUrl} sx={{ width: "4rem", height: "4rem" }}></Avatar>
        </div>
      </div>
      <div className="flex flex-col">
        <p>{t("create_trip.hosted_by", { hostName })}</p>
        <p>{hostAddress}</p>
        <p className="text-sm text-gray-500">{t("create_trip.contacts_after_booking")}</p>
      </div>
    </div>
  );
}
