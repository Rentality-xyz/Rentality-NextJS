import { useState } from "react";
import { Stack, styled, Switch, Typography } from "@mui/material";
import ChooseBlockchainComponent from "@/components/choose_blockchain/ChooseBlockchainComponent";
import LoginBase from "./LoginBase";
import useUserMode, { isHost } from "@/hooks/useUserMode";

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 72,
  height: 30,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(42px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(42px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        background: "linear-gradient(360deg, rgba(88,63,188,1) 0%, rgba(128,95,228,1) 50%, rgba(127,160,243,1) 100%)",
        // backgroundColor: "#6D28D9",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 26,
    height: 26,
    borderRadius: 18,
    transition: theme.transitions.create(["width"], {
      duration: 700,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 30 / 2,
    opacity: 1,
    background: "linear-gradient(360deg, rgba(88,63,188,1) 0%, rgba(128,95,228,1) 50%, rgba(127,160,243,1) 100%)",
    // backgroundColor: "#6D28D9",
    boxSizing: "border-box",
  },
}));

export default function Header() {
  const { userMode } = useUserMode();
  const [isSelectedHost, setIsSelectedHost] = useState(isHost(userMode));

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSelectedHost(event.target.checked);
    //router.push(event.target.checked ? "/host" : "/guest");
    if (event.target.checked) {
      window.location.href = "/host";
    } else {
      window.location.href = "/guest";
    }
  };

  return (
    <header className="text-rnt-temp-header-text pt-1.5 w-full">
      <div className="flex w-full pl-2 pr-2 sm:pr-6 py-2 min-h-[7rem] justify-between">
        <div className="flex flex-row items-center">
          <div className="font-bold text-xl lg:text-3xl max-sm:hidden sm:pl-[42px]">{userMode} account</div>
        </div>
        <div className="flex flex-row items-center ml-6">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography className="text-lg font-['Montserrat',Arial,sans-serif]">Guest</Typography>
            <AntSwitch checked={isSelectedHost} onChange={handleChange} inputProps={{ "aria-label": "ant design" }} />
            <Typography className="text-lg font-['Montserrat',Arial,sans-serif]">Host</Typography>
          </Stack>
          <ChooseBlockchainComponent />
          <LoginBase />
        </div>
      </div>
    </header>
  );
}
