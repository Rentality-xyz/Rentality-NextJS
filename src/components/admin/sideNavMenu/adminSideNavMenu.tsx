import Head from "next/head";
import Image from "next/image";
import logo from "../../../images/logo.png";
import Link from "next/link";

export default function AdminSideNavMenu() {
  return (
    <aside className="pl-12 pr-4 py-8 bg-gray-600 bg-opacity-60 text-white">
      <Image className="w-56 h-auto" src={logo} alt="" />
      <nav className="w-64 pt-4">
        <div className="pt-4">
          <div className="py-2 text-xl font-bold">
            <Link href="/admin">Contract info</Link>
          </div>
        </div>
      </nav>
    </aside>
  );
}
