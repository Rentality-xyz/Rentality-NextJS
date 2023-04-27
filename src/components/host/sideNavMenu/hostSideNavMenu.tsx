import Head from "next/head";
import Image from "next/image";
import logo from "../../../images/logo.png";
import Link from "next/link";

export default function HostSideNavMenu() {
  return (
    <aside className="w-1/5 h-auto pr-4 py-8 bg-yellow-300">
      <Image className="pr-6" src={logo} alt="" />
      <nav className="pt-4">
        <div className="pt-4">
          <div className="py-2 text-xl font-bold">Trips</div>
          <div className="py-1 h-12">
            <Link href="/host/trips/booked">Booked</Link>
          </div>
          <div className="py-1 h-12">
            <Link href="/host/trips/history">History</Link>
          </div>
        </div>
        <div className="pt-4">
          <div className="py-2 text-xl font-bold">Vehicles</div>
          <div className="py-1 h-12">
            <Link href="/host/vehicles/listings">Listing</Link>
          </div>
        </div>
      </nav>
    </aside>
  );
}
