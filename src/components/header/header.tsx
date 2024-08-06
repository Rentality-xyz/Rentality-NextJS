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
import { useRouter } from "next/router";
import LoginBase from "./LoginBase";

export default function Header({ accountType }: { accountType: string }) {
  accountType = accountType ?? "Host";
  const isHost = accountType === "Host";
  const router = useRouter();

  const { isHideBurgerMenu, openBurgerMenu, closeBurgerMenu } = useAppContext();
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
    //router.push(event.target.checked ? "/host" : "/guest");
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
          className="fixed left-0 top-[7rem] z-[100] h-full w-full overflow-auto bg-[#1E1E30] lg:hidden"
        >
          {isHost ? <HostBurgerNavMenu /> : <GuestBurgerNavMenu />}
        </div>
      )}
      <header className="pt-1.5 text-rnt-temp-header-text">
        <div className="flex min-h-[7rem] w-full justify-between py-2 pl-2 pr-2 sm:pr-6">
          <div className="flex flex-row items-center">
            <Image
              src={isHideBurgerMenu ? burgerMenuClose : burgerMenu}
              alt=""
              className="mr-4 lg:hidden"
              onClick={isHideBurgerMenu ? closeBurgerMenu : openBurgerMenu}
            />
            <div className="text-xl font-bold max-sm:hidden sm:pl-[42px] lg:text-3xl">{accountType} account</div>
          </div>
          <div className="flex flex-row items-center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography className="font-['Montserrat',Arial,sans-serif] text-lg">Guest</Typography>
              <AntSwitch checked={isSelectedHost} onChange={handleChange} inputProps={{ "aria-label": "ant design" }} />
              <Typography className="font-['Montserrat',Arial,sans-serif] text-lg">Host</Typography>
            </Stack>
            <ChooseBlockchainComponent />
            <LoginBase />
          </div>
        </div>
      </header>
    </div>
  );
}
