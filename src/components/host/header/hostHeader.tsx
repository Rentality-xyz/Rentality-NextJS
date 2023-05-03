import Head from "next/head";
import Image from "next/image";
import logo from "../../images/logo.png";
import Link from "next/link";
import { useRef } from "react";

export default function HostHeader() {
  const burgerMenuRef = useRef<HTMLDivElement>(null);

  function toggleBurgerMenu(): void {
    if (burgerMenuRef.current == null) return;

    burgerMenuRef.current.classList.toggle("change");
  }

  return (
    <header className="flex flex-row w-full h-24 justify-stretch bg-gray-200 bg-opacity-60">
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
          <span>Guest (</span>
          <input type="checkbox"></input>
          <span>) Host</span>
        </div>
        <div className="flex flex-row ml-16 items-center">
          <div className="flex flex-col m-2">
            <div>Name Surname</div>
            <div className="text-sm">address</div>
          </div>
          <div className="flex flex-col w-20 h-20 m-2 rounded-2xl items-center justify-center bg-gray-500">
            <div className="">Photo</div>
          </div>
        </div>
      </div>
    </header>
  );
}
