import Link from "next/link";
import { useRef } from "react";
import useEtherProvider from "@/hooks/useEtherProvider";
import RntButton from "../common/rntButton";

type Props = {
  accountType: string;
};

export default function Header({ accountType }: Props) {
  const [userConnected, userWeb3Address, formatAddress, connectMetaMask] =
    useEtherProvider();
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  accountType = accountType ?? "Host";
  const isHost = accountType === "Host";

  function toggleBurgerMenu(): void {
    if (burgerMenuRef.current == null) return;

    burgerMenuRef.current.classList.toggle("change");
  }

  return (
    <header className="bg-gray-200 bg-opacity-60 text-gray-900">
      <div className="flex flex-row w-full px-8 py-2 min-h-[7rem] justify-between">
        <div className="flex flex-row mr-16 items-center">
          <div className="font-bold text-3xl">{accountType} account</div>
        </div>
        <div className="flex flex-row items-center">
          <div className="flex flex-row mr-16">
            {/* <span>Guest (</span>
          <input type="checkbox"></input>
          <span>) Host</span> */}
            {isHost ? (
              <Link href="/guest">
                <RntButton className="w-48 h-10">Switch to Guest</RntButton>
              </Link>
            ) : (
              <Link href="/host">
                <RntButton className="w-48 h-10">Switch to Host</RntButton>
              </Link>
            )}
          </div>
          {userConnected ? (
            <div className="flex flex-row ml-16 items-center">
              <div className=" flex-col m-2 hidden lg:flex">
                <div>Name Surname</div>
                <div className="text-sm">{formatAddress(userWeb3Address)}</div>
              </div>
              <div className="flex flex-col w-20 h-20 m-2 rounded-full items-center justify-center bg-gray-500">
                <div className="">Photo</div>
              </div>
            </div>
          ) : (
            <RntButton
              className="w-40 h-10 text-md"
              onClick={() => {
                connectMetaMask();
              }}
            >
              Connect MetaMask
            </RntButton>
          )}
        </div>
      </div>
    </header>
  );
}
