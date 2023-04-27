import Head from "next/head";
import Image from "next/image";
import logo from "../../images/logo.png";
import Link from "next/link";

export default function ListingItem() {
  return (
    <div className="flex flex-row m-4 ml-0 bg-pink-300">
      <div className="w-60 h-48 bg-slate-400">
        {/* <Image src={logo} alt="" /> */}
      </div>
      <div className="flex flex-col">
        <div className="flex flex-row">
          <div>Ford Mustang 2023</div>
          <div>EE 099 TVQ</div>
        </div>
        <div className="flex flex-col">
          <div>$53/day</div>
          <div>$236 </div>
        </div>
      </div>
    </div>
  );
}
