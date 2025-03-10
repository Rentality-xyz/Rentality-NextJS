import Image from "next/image";
import Link from "next/link";
import moment from "moment";
import {
  LEGAL_CANCELLATION_NAME,
  LEGAL_PRIVACY_NAME,
  LEGAL_PROHIBITEDUSES_NAME,
  LEGAL_TERMS_NAME,
} from "@/utils/constants";
import useUserMode, { isHost } from "@/hooks/useUserMode";
import React, { forwardRef } from "react";

const Footer = forwardRef<HTMLDivElement>((props, ref) => {
  const { userMode } = useUserMode();
  const pathnameUserMode = isHost(userMode) ? "/host" : "/guest";

  return (
    <footer
      ref={ref}
      className="relative h-[800px] bg-[url('/images/bg-gradient-flip.jpg')] bg-cover bg-scroll bg-center bg-no-repeat min-[560px]:h-[450px] lg:h-[290px]"
    >
      <Image src={"/images/red-generic-sport-ca.png"} width={620} height={262} alt="" className="absolute bottom-0 left-0 max-[560px]:bottom-8" />
      <div
        id={"footer-content"}
        className="mx-auto flex h-full max-w-[1192px] flex-row text-white max-[560px]:flex-col"
      >
        <div
          id="footer-legal-matters"
          className="z-0 flex h-1/3 w-max flex-col pt-[30px] max-lg:mx-auto max-[560px]:items-center sm:h-full lg:ml-[540px] lg:pt-[40px] min-[1536px]:ml-[540px] min-[1720px]:ml-auto"
        >
          <Link
            href={`${pathnameUserMode}/legal?tab=${LEGAL_TERMS_NAME}`}
            target="_blank"
            className="cursor-pointer pb-1 font-['Montserrat',Arial,sans-serif] text-xl font-semibold hover:underline"
          >
            <strong>Legal matters</strong>
          </Link>

          <Link
            href={`${pathnameUserMode}/legal?tab=${LEGAL_TERMS_NAME}`}
            target="_blank"
            className="cursor-pointer pb-1.5 font-['Montserrat',Arial,sans-serif] text-base hover:underline"
          >
            <strong>Terms of service</strong>
          </Link>

          <Link
            href={`${pathnameUserMode}/legal?tab=${LEGAL_CANCELLATION_NAME}`}
            target="_blank"
            className="cursor-pointer pb-1.5 font-['Montserrat',Arial,sans-serif] text-base hover:underline"
          >
            <strong>Cancellation policy</strong>
          </Link>

          <Link
            href={`${pathnameUserMode}/legal?tab=${LEGAL_PROHIBITEDUSES_NAME}`}
            target="_blank"
            className="cursor-pointer pb-1.5 font-['Montserrat',Arial,sans-serif] text-base hover:underline"
          >
            <strong>Prohibited uses</strong>
          </Link>

          <Link
            href={`${pathnameUserMode}/legal?tab=${LEGAL_PRIVACY_NAME}`}
            target="_blank"
            className="cursor-pointer pb-1.5 font-['Montserrat',Arial,sans-serif] text-base hover:underline"
          >
            <strong>Privacy policy</strong>
          </Link>
          <div className="z-0 mt-auto hidden sm:flex">
            UIcons by&nbsp;<a href="https://www.flaticon.com/uicons">Flaticon</a>
          </div>
        </div>

        <div className="z-0 flex h-full w-max flex-col items-center pt-[30px] max-lg:mx-auto lg:ml-auto lg:pt-[40px]">
          <Link href={"https://apps.apple.com/ua/app/rentality/id6736899320"} target="_blank" className="">
            <Image src={"/images/marketplace/ic_appstore.svg"} width={1885} height={628} alt="" className="w-[200px]" />
          </Link>
          <Link
            href={"https://play.google.com/store/apps/details?id=xyz.rentality.rentality"}
            target="_blank"
            className=""
          >
            <Image src={"/images/marketplace/ic_google_play.svg"} width={1885} height={628} alt="" className="mt-4 w-[200px]" />
          </Link>
        </div>

        <div
          id={"footer-info-block"}
          className="z-0 flex h-full w-max flex-col items-center pt-[30px] max-lg:mx-auto lg:ml-auto lg:pt-[40px]"
        >
          <Image src={"/images/logo.svg"} width={171} height={37} alt="" className="mb-2 h-auto min-w-[180px] max-w-[180px]" />
          <div>
            <a
              href="mailto:info@rentality.io"
              className="pt-4 text-center font-['Montserrat',Arial,sans-serif] text-base font-normal lg:pt-9"
            >
              <div>info@rentality.io</div>
            </a>

            <div className="mt-1.5 flex flex-col items-center">
              <div className="flex gap-4">
                <a
                  href="https://www.linkedin.com/company/rentalitycorp/?viewAsMember=true"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image src={"/images/social/linkedin-logo.svg"} width={24} height={24} alt="" className="w-[30px]" />
                </a>

                <a href="https://twitter.com/Rentality_Info" target="_blank" rel="noopener noreferrer">
                  <Image src={"/images/social/x-logo.svg"} width={24} height={24} alt="" className="ml-1.5 w-[30px]" />
                </a>

                <a href="https://discord.gg/rentality" target="_blank" rel="noopener noreferrer">
                  <Image src={"/images/social/discord-logo.svg"} width={24} height={24} alt="" className="ml-1.5 w-[30px]" />
                </a>
              </div>
              <div className="flex gap-4">
                <a href="https://t.me/rentality_xyz" target="_blank" rel="noopener noreferrer">
                  <Image src={"/images/social/telegram-logo.svg"} width={24} height={24} alt="" className="w-[30px]" />
                </a>

                <a
                  href="https://mirror.xyz/0x263660F0ab0014e956d42f85DccD918bBa2Df587"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image src={"/images/social/mirror-logo.svg"} width={24} height={24} alt="" className="ml-1.5 w-[30px]" />
                </a>

                <a href="https://warpcast.com/rentality" target="_blank" rel="noopener noreferrer">
                  <Image src={"/images/social/warpcast-logo.svg"} width={24} height={24} alt="" className="ml-1.5 w-[30px]" />
                </a>
              </div>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/rentality_/" target="_blank" rel="noopener noreferrer">
                  <Image src={"/images/social/instagram-logo.svg"} width={24} height={24} alt="" className="w-[30px]" />
                </a>

                <a href="https://medium.com/@rentality" target="_blank" rel="noopener noreferrer">
                  <Image src={"/images/social/medium-logo.svg"} width={24} height={24} alt="" className="ml-1.5 w-[30px]" />
                </a>

                <a href="https://www.youtube.com/@Rentality_xyz/videos" target="_blank" rel="noopener noreferrer">
                  <Image src={"/images/social/youtube-logo.png"} width={24} height={24} alt="" className="ml-1.5 w-[30px]" />
                </a>
              </div>
            </div>
          </div>
          <div className="z-0 mt-52 font-['Montserrat',Arial,sans-serif] min-[560px]:mt-auto">
            ©{moment().year()} by Rentality LLC
          </div>
          <div className="z-0 text-center text-xs sm:hidden">
            UIcons by <a href="https://www.flaticon.com/uicons">Flaticon</a>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
export default Footer;
