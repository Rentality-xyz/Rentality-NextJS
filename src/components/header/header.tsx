import { useState } from "react";
import { Stack, styled, Switch, Typography } from "@mui/material";
import burgerMenu from "../../images/ic-menu-burge-white-20.svg";
import burgerMenuClose from "../../images/ic-menu-burge-close-white-20.svg";
import Image from "next/image";
import { useAppContext } from "@/contexts/appContext";
import ChooseBlockchainComponent from "@/components/choose_blockchain/ChooseBlockchainComponent";
import { GuestBurgerNavMenu } from "../sideNavMenu/guestSideNavMenu";
import { HostBurgerNavMenu } from "../sideNavMenu/hostSideNavMenu";
import Login from "./login";
import Deposit from "@/components/guest/deposit";

export default function Header({ accountType }: { accountType: string }) {
  accountType = accountType ?? "Host";
  const isHost = accountType === "Host";

  const { isHideBurgerMenu, toggleBurgerMenu } = useAppContext();
  const [isSelectedHost, setIsSelectedHost] = useState(isHost);

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSelectedHost(event.target.checked);
    if (event.target.checked) {
      window.location.href = "/host";
    } else {
      window.location.href = "/guest";
    }
  };

  return (
    <div>
      {isHideBurgerMenu && (
        <div
          id="burger-menu-wrapper"
          className="fixed top-[7rem] left-0 w-full h-full z-[100] bg-[#1E1E30] overflow-auto lg:hidden"
        >
          {isHost ? <HostBurgerNavMenu /> : <GuestBurgerNavMenu />}
        </div>
      )}
      <header className="text-rnt-temp-header-text">
        <div className="flex w-full px-2 py-2 min-h-[7rem] justify-between">
          <div className="flex flex-row items-center">
            <Image
              src={isHideBurgerMenu ? burgerMenuClose : burgerMenu}
              alt=""
              className="lg:hidden mr-4"
              onClick={toggleBurgerMenu}
            />
            <div className="font-bold text-xl lg:text-3xl max-sm:hidden">{accountType} account</div>
          </div>
          <div className="flex flex-row items-center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography className="text-lg font-['Montserrat',Arial,sans-serif]">Guest</Typography>
              <AntSwitch checked={isSelectedHost} onChange={handleChange} inputProps={{ "aria-label": "ant design" }} />
              <Typography className="text-lg font-['Montserrat',Arial,sans-serif]">Host</Typography>
            </Stack>

            <ChooseBlockchainComponent />
            <Deposit />
            <Login />
          </div>
        </div>
      </header>
    </div>
  );
}
