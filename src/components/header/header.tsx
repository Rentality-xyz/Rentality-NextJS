import React, {useEffect, useState} from "react";
import { Stack, styled, Switch, Typography } from "@mui/material";
import ChooseBlockchainComponent from "@/components/choose_blockchain/ChooseBlockchainComponent";
import LoginBase from "./LoginBase";
import useUserMode, { isHost } from "@/hooks/useUserMode";
import Image from "next/image";
import HeaderLogo from "@/components/sideNavMenu/headerLogo";
import RntMobileStoresDialog from "@/components/common/rntMobileStoresDialog";
import burgerMenuClose from "@/images/ic-menu-burge-close-white-20.svg";
import burgerMenu from "@/images/ic-menu-burge-white-20.svg";
import {useAppContext} from "@/contexts/appContext";
import {HostBurgerNavMenu} from "@/components/sideNavMenu/hostSideNavMenu";
import {GuestBurgerNavMenu} from "@/components/sideNavMenu/guestSideNavMenu";


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

  const { isBurgerMenuShown, isFilterOnSearchPageShown, openBurgerMenu, closeBurgerMenu } = useAppContext();
  useEffect(() => {
    const body = document.body;
    if (isBurgerMenuShown || isFilterOnSearchPageShown) {
      body.classList.add("overflow-hidden");
    } else {
      body.classList.remove("overflow-hidden");
    }
  }, [isBurgerMenuShown, isFilterOnSearchPageShown]);
  const burgerNavMenu = isHost(userMode) ? <HostBurgerNavMenu /> : <GuestBurgerNavMenu />;

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
    <header className="fixed flex justify-between items-center w-full bg-rentality-bg-left-sidebar border-b-2 border-b-[#ffffff1f] lg:py-1 max-lg:pl-4 lg:pl-14 lg:pr-6 z-50 text-rnt-temp-header-text">
      <div className="flex max-lg:justify-between max-lg:w-full">
        <HeaderLogo />
        <div className="flex items-center lg:hidden">
          {isBurgerMenuShown && (
              <div
                  id="burger-menu-wrapper"
                  className="fixed left-0 top-[50px] z-[100] h-full w-full overflow-auto"
              >
                <aside id="burger-menu" className="bg-rentality-bg-left-sidebar">
                  {burgerNavMenu}
                </aside>
              </div>
          )}

          <div className="flex flex-col w-full min-w-0 xl:grow">
            <Image
                height={28}
                src={isBurgerMenuShown ? burgerMenuClose : burgerMenu}
                alt=""
                className="lg:hidden"
                onClick={isBurgerMenuShown ? closeBurgerMenu : openBurgerMenu}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center max-lg:justify-between max-lg:w-full ml-2">
        <RntMobileStoresDialog />
        <Stack direction="row" spacing={1} alignItems="center" className="lg:ml-12 max-lg:mx-3">
          <Typography className="font-['Montserrat',Arial,sans-serif] text-lg max-lg:hidden">Guest</Typography>
          <Typography className="font-['Montserrat',Arial,sans-serif] text-lg lg:hidden">
            {isSelectedHost ? 'Host' : 'Guest'}
          </Typography>
          <AntSwitch checked={isSelectedHost} onChange={handleChange} inputProps={{ "aria-label": "ant design" }} />
          <Typography className="font-['Montserrat',Arial,sans-serif] text-lg max-lg:hidden">Host</Typography>
        </Stack>
        <ChooseBlockchainComponent />
        <LoginBase />
      </div>
    </header>
  );
}
