import React, { useState } from "react";
import { Stack, styled, Switch, Typography } from "@mui/material";
import ChooseBlockchainComponent from "@/components/choose_blockchain/ChooseBlockchainComponent";
import LoginBase from "./LoginBase";
import useUserMode, { isHost } from "@/hooks/useUserMode";
import Image from "next/image";
import imgStore from "@/images/app-google-store.svg";
import HeaderLogo from "@/components/sideNavMenu/headerLogo";
import RntMobileStoresDialog from "@/components/common/rntMobileStoresDialog";

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
    <header className="fixed flex justify-between items-center w-full bg-rentality-bg-dark py-1 pl-14 pr-6 z-50 text-rnt-temp-header-text">
      <HeaderLogo />
      <RntMobileStoresDialog />
      <div className="ml-6 flex flex-row items-center">
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography className="font-['Montserrat',Arial,sans-serif] text-lg">Guest</Typography>
          <AntSwitch checked={isSelectedHost} onChange={handleChange} inputProps={{ "aria-label": "ant design" }} />
          <Typography className="font-['Montserrat',Arial,sans-serif] text-lg">Host</Typography>
        </Stack>
        <ChooseBlockchainComponent />
        <LoginBase />
      </div>
    </header>
  );
}
