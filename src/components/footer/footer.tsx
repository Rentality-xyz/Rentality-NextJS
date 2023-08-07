import Image from "next/image";
import logo from "../../images/logo.png";

export default function Footer() {
  return (
    <footer className="pl-12 pr-4 py-8">
      <div className="flex flex-row">
        <div className="flex flex-col w-1/2">
          <Image src={logo} alt="" />
        </div>
        <div className="flex flex-col w-1/2">
          <div className="text-3xl font-semibold">Contacts</div>
          <div className="text-2xl">+1 (888) 892-6789</div>
          <div className="text-xl">info@rentality.us</div>
        </div>
      </div>
      <span>©2023 by Rentality LLC</span>
    </footer>
  );
}
