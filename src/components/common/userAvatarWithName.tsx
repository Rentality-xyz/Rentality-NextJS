import { Avatar } from "@mui/material";
import { memo } from "react";

function UserAvatarWithName({ photoUrl, userName, label }: { photoUrl: string; userName: string; label: string }) {
  return (
    <div className="flex flex-row items-center">
      <div className="mr-2 h-12 w-12 self-center">
        <Avatar src={photoUrl} sx={{ width: "3rem", height: "3rem" }}></Avatar>
      </div>
      <div className="flex flex-col truncate">
        <p className="text-xs">{label}</p>
        <p className="text-sm">{userName ?? "-"}</p>
      </div>
    </div>
  );
}

export default memo(UserAvatarWithName);
