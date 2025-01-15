import Image from "next/image";
// @ts-ignore
import logo from "../../images/logo.svg";
// @ts-ignore
import bgCar from "../../images/red-generic-sport-ca.png";
// @ts-ignore
import linkedin from "../../images/social/linkedin-logo.svg";
// @ts-ignore
import twitter from "../../images/social/x-logo.svg";
// @ts-ignore
import discord from "../../images/social/discord-logo.svg";
// @ts-ignore
import telegram from "../../images/social/telegram-logo.svg";
// @ts-ignore
import mirror from "../../images/social/mirror-logo.svg";
// @ts-ignore
import instagram from "../../images/social/instagram-logo.svg";
// @ts-ignore
import medium from "../../images/social/medium-logo.svg";
// @ts-ignore
import warpcast from "../../images/social/warpcast-logo.svg";
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
      className="relative h-[600px] bg-[url('../images/bg-gradient-flip.jpg')] bg-cover bg-scroll bg-center bg-no-repeat min-[560px]:h-[450px] lg:h-[290px]"
    >
      <Image src={bgCar} alt="" className="absolute bottom-0 left-0 max-[560px]:bottom-8" />
      <div
        id={"footer-content"}
        className="mx-auto flex h-full max-w-[1192px] flex-row text-white max-[560px]:flex-col"
      >
        <div
          id="footer-legal-matters"
          className="z-0 flex h-1/3 w-max flex-col pt-[30px] max-lg:mx-auto sm:h-full lg:ml-[540px] lg:pt-[40px] min-[1536px]:ml-[540px] min-[1720px]:ml-auto max-[560px]:items-center"
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

        <div
          id={"footer-info-block"}
          className="z-0 flex h-full w-max flex-col pt-[30px] max-lg:mx-auto lg:ml-auto lg:pt-[40px] max-[560px]:items-center"
        >
          <Image src={logo} alt="" className="mb-2 h-auto min-w-[180px] max-w-[180px]" />
          <div>
            <a
              href="mailto:info@rentality.xyz"
              className="pt-4 font-['Montserrat',Arial,sans-serif] text-base font-normal lg:pt-9"
            >
              <div>info@rentality.xyz</div>
            </a>

            <div className="mt-1.5 flex flex-col">
              <div className="flex">
                <a
                  href="https://www.linkedin.com/company/rentalitycorp/?viewAsMember=true"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image src={linkedin} alt="" className="w-[30px]" />
                </a>

                <a href="https://twitter.com/Rentality_Info" target="_blank" rel="noopener noreferrer">
                  <Image src={twitter} alt="" className="ml-1.5 w-[30px]" />
                </a>

                <a href="https://discord.gg/rentality" target="_blank" rel="noopener noreferrer">
                  <Image src={discord} alt="" className="ml-1.5 w-[30px]" />
                </a>

                {/*<a href="mailto:info@rentality.xyz" className="lg:hidden">*/}
                {/*  <Image src={email} alt="" className="ml-1.5 w-[30px]" />*/}
                {/*</a>*/}

                <a href="https://t.me/rentality_xyz" target="_blank" rel="noopener noreferrer">
                  <Image src={telegram} alt="" className="ml-1.5 w-[30px]" />
                </a>
              </div>
              <div className="flex">
                <a
                  href="https://mirror.xyz/0x263660F0ab0014e956d42f85DccD918bBa2Df587"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image src={mirror} alt="" className="w-[30px]" />
                </a>

                <a href="https://warpcast.com/rentality" target="_blank" rel="noopener noreferrer">
                  <Image src={warpcast} alt="" className="ml-1.5 w-[30px]" />
                </a>

                <a href="https://www.instagram.com/rentality_/" target="_blank" rel="noopener noreferrer">
                  <Image src={instagram} alt="" className="ml-1.5 w-[30px]" />
                </a>

                <a href="https://medium.com/@rentality" target="_blank" rel="noopener noreferrer">
                  <Image src={medium} alt="" className="ml-1.5 w-[30px]" />
                </a>
              </div>
            </div>
          </div>
          <div className="z-0 min-[560px]:mt-auto mt-52 font-['Montserrat',Arial,sans-serif]">©{moment().year()} by
            Rentality LLC
          </div>
          <div className="z-0 text-xs sm:hidden text-center">
            UIcons by <a href="https://www.flaticon.com/uicons">Flaticon</a>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
export default Footer;
