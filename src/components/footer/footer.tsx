import Image from "next/image";
import logo from "../../images/logo.png";

export default function Footer() {
  return (
    <footer className="pl-12 pr-4 py-8">
      <div className="flex flex-row">
        <div className="w-1/2 flex flex-col">
          <Image src={logo} alt="" />
        </div>
        <div className="w-1/2 flex flex-col gap-4">
          <div className="text-3xl font-semibold">Contacts</div>
          <div className="text-xl">info@rentality.xyz</div>
        </div>
      </div>
      <span>©2023 by Rentality LLC</span>
    </footer>
  );
}
