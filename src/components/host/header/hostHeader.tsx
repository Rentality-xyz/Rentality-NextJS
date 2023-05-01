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
    <header className="flex flex-row flex-shrink-0 w-full h-24 justify-stretch bg-emerald-300">
      {/* <div
        className="burger-icon"
        ref={burgerMenuRef}
        onClick={() => toggleBurgerMenu()}
      >
        <div className="burger-icon-bar1"></div>
        <div className="burger-icon-bar2"></div>
        <div className="burger-icon-bar3"></div>
      </div> */}
      <div className="flex flex-row w-full justify-end">
        <div className="flex flex-row mr-16 items-center">
          <span>Guest (</span>
          <input type="checkbox"></input>
          <span>) Host</span>
        </div>
        <div className="flex flex-row ml-16 items-center">
          <div className="flex flex-col m-2">
            <div>UserName UserSurname</div>
            <div className="text-sm">address</div>
          </div>
          <div className="m-2">avatar</div>
        </div>
      </div>
    </header>
  );
}
