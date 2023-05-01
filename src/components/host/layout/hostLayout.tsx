import Footer from "@/components/footer/footer";
import HostHeader from "@/components/host/header/hostHeader";
import HostSideNavMenu from "@/components/host/sideNavMenu/hostSideNavMenu";
import styles from './hostLayout.module.css'

type Props = {
  children?: React.ReactNode;
};

export default function HostLayout({ children }: Props) {
  return (
    <>
      {/* <div className="flex flex-col w-full h-full px-16 text-white">
        <div className="flex flex-row w-full bg-red-400">
          <HostSideNavMenu />
          <div className="flex flex-col w-full h-auto bg-amber-300">
            <HostHeader />
            <main className="main w-full h-full bg-orange-300">{children}</main>
          </div>
        </div>
        <Footer />
      </div> */}

      <div className={styles.mainGrid + " w-full h-full bg-red-400 text-white"}>
        <HostSideNavMenu />
        <HostHeader />
        <main className="main w-full h-full bg-orange-300">{children}</main>
        <Footer />
      </div>
    </>
  );
}
