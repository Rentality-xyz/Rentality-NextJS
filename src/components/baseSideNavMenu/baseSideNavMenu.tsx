import Image from "next/image";
import logo from "../../images/logo.png";

type Props = {
  children?: React.ReactNode;
};

export default function BaseSideNavMenu({children}:Props) {
  return (
    <aside className="pl-14 pr-12 py-12 bg-gray-600 bg-opacity-60 text-white">
      <div className="w-40">
        <Image alt="" width={200} height={200} src={logo} />
      </div>
      <nav className="w-full pt-4">
        {children}
      </nav>
    </aside>
  );
}
