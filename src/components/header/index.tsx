import Head from "next/head";
import Image from "next/image";
import logo from "../../images/logo.png";
import Link from "next/link";

export default function Header() {
  return (
    <div className="flex flex-row w-full h-24 bg-green-300 ">
      <div className="left mt-9 ml-32">
        <Link href="/">
          <Image src={logo} alt="" />
        </Link>
      </div>
      <div className="flex flex-row w-full h-auto place-content-stretch bg-green-600 ">
        <div>
          <Link href="/">Our fleet</Link>
        </div>
        <div>
          <Link href="/">FAQs</Link>
        </div>
        <div>
          <Link href="/">Legal metters</Link>
        </div>
        <div>
          <Link href="/host/vehicles">Try demo</Link>
          <button>Book now</button>
        </div>
        <div>
          <button>+1 (888) 892-6789</button>
        </div>
      </div>
    </div>
  );
}
