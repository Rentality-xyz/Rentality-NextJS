import Head from "next/head";
import Image from "next/image";
import logo from "../../images/logo.png";
import Link from "next/link";
import { useRef } from "react";
import useEtherProvider from "@/hooks/useEtherProvider";

type Props = {
  isHost: boolean;
};

export default function Header({ isHost }: Props) {
  const [userConnected, userWeb3Address, formatAddress, connectMetaMask] =
    useEtherProvider();
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  isHost = isHost ?? true;

  function toggleBurgerMenu(): void {
    if (burgerMenuRef.current == null) return;

    burgerMenuRef.current.classList.toggle("change");
  }

  return (
    <header className="bg-gray-200 bg-opacity-60">
      {/* <div
        className="burger-icon"
        ref={burgerMenuRef}
        onClick={() => toggleBurgerMenu()}
      >
        <div className="burger-icon-bar1"></div>
        <div className="burger-icon-bar2"></div>
        <div className="burger-icon-bar3"></div>
      </div> */}
      <div className="flex flex-row w-full px-8 py-4 justify-end border-b-2 border-gray-400">
        <div className="flex flex-row mr-16 items-center">
          {/* <span>Guest (</span>
          <input type="checkbox"></input>
          <span>) Host</span> */}
          {isHost ? (
            <Link href="/guest">
              <button className="w-40 h-10 bg-violet-700 rounded-md">
                Switch to Guest
              </button>
            </Link>
          ) : (
            <Link href="/host">
              <button className="w-40 h-10 bg-violet-700 rounded-md">
                Switch to Host
              </button>
            </Link>
          )}
        </div>
        {userConnected ? (
          <div className="flex flex-row ml-16 items-center">
            <div className="flex flex-col m-2">
              <div>Name Surname</div>
              <div className="text-sm">{formatAddress(userWeb3Address)}</div>
            </div>
            <div className="flex flex-col w-20 h-20 m-2 rounded-2xl items-center justify-center bg-gray-500">
              <div className="">Photo</div>
            </div>
          </div>
        ) : (
          <button
            className="w-40 h-10 bg-violet-700 rounded-md"
            onClick={() => {
              connectMetaMask();
            }}
          >
            Connect MetaMask
          </button>
        )}
      </div>
    </header>
  );
}
