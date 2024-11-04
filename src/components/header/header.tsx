import React, { useCallback, useEffect, useRef, useState } from "react";
import { Stack, styled, Switch, Typography } from "@mui/material";
import ChooseBlockchainComponent from "@/components/choose_blockchain/ChooseBlockchainComponent";
import LoginBase from "./LoginBase";
import useUserMode, { isHost } from "@/hooks/useUserMode";
import Image from "next/image";
import HeaderLogo from "@/components/sideNavMenu/headerLogo";
import RntMobileStoresDialog from "@/components/common/rntMobileStoresDialog";
import burgerMenuClose from "@/images/ic-menu-burge-close-white-20.svg";
import burgerMenu from "@/images/ic-menu-burge-white-20.svg";
import { useAppContext } from "@/contexts/appContext";
import { HostBurgerNavMenu } from "@/components/sideNavMenu/hostSideNavMenu";
import { GuestBurgerNavMenu } from "@/components/sideNavMenu/guestSideNavMenu";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "@/contexts/auth/authContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { formatEther } from "ethers";
import icLogout from "@/images/ic_logout.png";
import icProfileSettings from "@/images/ic_profile_settings.png";
import imgCopy from "@/images/ic_copy_24dp.svg";
import icBaseScan from "@/images/base-scan-log.svg";
import icWalletBalance from "@/images/ic_wallet_balance.svg";

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
  const { isAuthenticated, logout } = useAuth();
  const ethereumInfo = useEthereum();

  const router = useRouter();
  useEffect(() => {
    if (isHost(userMode)) {
      setIsSelectedHost(true);
    } else {
      setIsSelectedHost(false);
    }
  }, [router.pathname]);

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
    if (event.target.checked) {
      window.location.href = "/host";
    } else {
      window.location.href = "/guest";
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const handleAvatarClick = () => {
    setIsOpen(!isOpen);
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const [balance, setBalance] = useState<string>("0");
  const getWalletBalance = async (): Promise<string> => {
    try {
      const walletAddress = ethereumInfo?.walletAddress ?? "";
      const balance = await ethereumInfo?.provider.getBalance(walletAddress);
      return balance ? parseFloat(formatEther(balance)).toFixed(2) : "0";
    } catch (error) {
      console.error("Error while retrieving balance:", error);
      return "0";
    }
  };
  useEffect(() => {
    const fetchBalance = async () => {
      const walletBalance = await getWalletBalance();
      setBalance(walletBalance);
    };

    fetchBalance();
  }, []);

  return (
    <header className="fixed z-50 flex w-full items-center justify-between border-b-2 border-b-[#ffffff1f] bg-rentality-bg-left-sidebar text-rnt-temp-header-text max-lg:pl-4 lg:py-1 lg:pl-14 lg:pr-6">
      <div className="flex max-lg:w-full max-lg:justify-between">
        <HeaderLogo />
        <div className="flex min-w-[20px] items-center lg:hidden">
          {isBurgerMenuShown && (
            <div id="burger-menu-wrapper" className="fixed left-0 top-[50px] z-[100] h-full w-full overflow-auto">
              <aside id="burger-menu" className="bg-rentality-bg-left-sidebar">
                {burgerNavMenu}
              </aside>
            </div>
          )}

          <div className="flex w-full min-w-0 flex-col xl:grow">
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
      <div className="ml-2 flex flex-row items-center max-lg:w-full max-lg:justify-between">
        <RntMobileStoresDialog />
        <Stack direction="row" spacing={1} alignItems="center" className="max-lg:mx-3 lg:ml-12">
          <Typography className="font-['Montserrat',Arial,sans-serif] text-lg max-lg:hidden">Guest</Typography>
          <Typography className="font-['Montserrat',Arial,sans-serif] text-lg lg:hidden">
            {isSelectedHost ? "Host" : "Guest"}
          </Typography>
          <AntSwitch checked={isSelectedHost} onChange={handleChange} inputProps={{ "aria-label": "ant design" }} />
          <Typography className="font-['Montserrat',Arial,sans-serif] text-lg max-lg:hidden">Host</Typography>
        </Stack>
        <ChooseBlockchainComponent />
        {isAuthenticated ? (
          <div ref={dropdownRef}>
            <div className="relative" onClick={handleAvatarClick}>
              <LoginBase />
              {isOpen && (
                <div className="absolute right-2 z-10 flex w-60 flex-col rounded-lg border border-gray-500 bg-rentality-bg-left-sidebar py-2 pl-2 font-['Montserrat',Arial,sans-serif] text-white sm:right-[-16px]">
                  <div className="mb-3 flex items-center leading-tight">
                    <Image src={icWalletBalance} width={30} height={30} alt="" />
                    <div className="flex flex-col">
                      <span className="ml-1">Wallet Balance</span>
                      <span className="ml-1 text-sm">{`${balance} ETH`}</span>
                    </div>
                  </div>
                  <Link
                    className="mb-3 flex cursor-pointer items-center hover:underline"
                    href={`https://basescan.org/address/${ethereumInfo?.walletAddress ?? ""}`}
                    target={"_blank"}
                  >
                    <Image src={icBaseScan} width={30} height={30} alt="" />
                    <span className="ml-1">Open in Base Explorer</span>
                  </Link>
                  <div
                    className="mb-3 flex cursor-pointer items-center hover:underline"
                    onClick={() => copyToClipboard(ethereumInfo?.walletAddress ?? "")}
                  >
                    <Image src={imgCopy} width={30} height={30} alt="" />
                    <span className="ml-1">Copy Address</span>
                  </div>
                  <Link className="mb-3 flex cursor-pointer items-center hover:underline" href="/guest/profile">
                    <Image src={icProfileSettings} width={30} height={30} alt="" />
                    <span className="ml-1">Edit Profile</span>
                  </Link>
                  <Link className="flex cursor-pointer items-center hover:underline" href="/" onClick={logout}>
                    <Image src={icLogout} width={30} height={30} alt="" />
                    <span className="ml-1">Logout</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <LoginBase />
        )}
      </div>
    </header>
  );
}
