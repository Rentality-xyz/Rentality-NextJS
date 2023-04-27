import Head from "next/head";
import Image from "next/image";
import logo from "../../images/logo.png";
import Link from "next/link";

export default function HostHeader() {
  return (
    <header className="flex flex-row flex-shrink-0 w-full h-24 place-content-end bg-emerald-300">
      <div className="flex flex-row mr-16 items-center">
        <span>Guest</span>
        <span> ( ) </span>
        <span>Host</span>
      </div>
      <div className="flex flex-row ml-16 items-center">
        <div className="flex flex-col m-2">
          <div>UserName UserSurname</div>
          <div className="text-sm">address</div>
        </div>
        <div className="m-2">avatar</div>
      </div>
    </header>
  );
}
