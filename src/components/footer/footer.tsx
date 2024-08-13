import Image from "next/image";
import logo from "../../images/logo.svg";
import bgCar from "../../images/red-generic-sport-ca.png";
import linkedin from "../../images/ic-linkedin-50.png";
import twitter from "../../images/ic_twitter.svg";
import discord from "../../images/ic-discord-50.png";
import email from "../../images/ic-email-50.png";
import telegram from "../../images/ic_telegram.svg";
import mirror from "../../images/ic_mirror_logo.svg";
import instagram from "../../images/instagram-social-media.svg";
import medium from "../../images/medium_logo.svg";
import warpcast from "../../images/warpcast-logo.png";
import Link from "next/link";
import moment from "moment";

export default function Footer() {
  return (
    <footer className="relative h-[500px] bg-[url('../images/bg-gradient-flip.jpg')] bg-cover bg-scroll bg-center bg-no-repeat min-[560px]:h-[450px] lg:h-[290px]">
      <Image src={bgCar} alt="" className="absolute bottom-0 left-0" />
      <div
        id={"footer-content"}
        className="mx-auto flex h-full max-w-[1192px] flex-row text-white max-[560px]:flex-col"
      >
        <div
          id="footer-legal-matters"
          className="z-0 flex h-1/3 w-max flex-col pt-[30px] max-lg:mx-auto sm:h-full lg:ml-[540px] lg:pt-[40px] min-[1536px]:ml-[540px] min-[1720px]:ml-auto"
        >
          <Link
            href="https://rentality.xyz/legalmatters"
            target="_blank"
            className="cursor-pointer pb-1 font-['Montserrat',Arial,sans-serif] text-xl font-semibold hover:underline"
          >
            <strong>Legal matters</strong>
          </Link>

          <Link
            href="https://rentality.xyz/legalmatters/terms"
            target="_blank"
            className="cursor-pointer pb-1.5 font-['Montserrat',Arial,sans-serif] text-base hover:underline"
          >
            <strong>Terms of service</strong>
          </Link>

          <Link
            href="https://rentality.xyz/legalmatters/cancellation"
            target="_blank"
            className="cursor-pointer pb-1.5 font-['Montserrat',Arial,sans-serif] text-base hover:underline"
          >
            <strong>Cancellation policy</strong>
          </Link>

          <Link
            href="https://rentality.xyz/legalmatters/prohibiteduses"
            target="_blank"
            className="cursor-pointer pb-1.5 font-['Montserrat',Arial,sans-serif] text-base hover:underline"
          >
            <strong>Prohibited uses</strong>
          </Link>

          <Link
            href="https://rentality.xyz/legalmatters/privacy"
            target="_blank"
            className="cursor-pointer pb-1.5 font-['Montserrat',Arial,sans-serif] text-base hover:underline"
          >
            <strong>Privacy policy</strong>
          </Link>
          <div className="z-0 mt-auto hidden sm:flex">
            UIcons by <a href="https://www.flaticon.com/uicons">Flaticon</a>
          </div>
        </div>

        <div
          id={"footer-info-block"}
          className="z-0 flex h-full w-max flex-col pt-[30px] max-lg:mx-auto lg:ml-auto lg:pt-[40px]"
        >
          <Image src={logo} alt="" className="mb-2 h-auto min-w-[180px] max-w-[180px]" />
          <div>
            <a
              href="mailto:info@rentality.xyz"
              className="pt-4 font-['Montserrat',Arial,sans-serif] text-base font-normal max-lg:hidden lg:pt-9"
            >
              <div>info@rentality.xyz</div>
            </a>

            <div className="flex flex-col mt-1.5 w-[256px]">
              <div className="flex">
                <a
                    href="https://www.linkedin.com/company/rentalitycorp/?viewAsMember=true"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                  <Image src={linkedin} alt="" className="mt-0.5 w-[30px]" />
                </a>

                <a href="https://twitter.com/Rentality_Info" target="_blank" rel="noopener noreferrer">
                  <Image src={twitter} alt="" className="ml-3 mt-1.5 w-[22px]" />
                </a>

                <a href="https://discord.gg/rentality" target="_blank" rel="noopener noreferrer">
                  <Image src={discord} alt="" className="ml-3 mt-0.5 w-[30px]" />
                </a>

                <a href="mailto:info@rentality.xyz" className="lg:hidden">
                  <Image src={email} alt="" className="ml-3 mt-0.5 w-[30px]" />
                </a>

                <a href="https://t.me/rentality_xyz" target="_blank" rel="noopener noreferrer">
                  <Image src={telegram} alt="" className="ml-3 mt-0.5 w-[30px]" />
                </a>

                <a
                    href="https://mirror.xyz/0x263660F0ab0014e956d42f85DccD918bBa2Df587"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                  <Image src={mirror} alt="" className="ml-1 w-[36px]" />
                </a>

                <a href="https://warpcast.com/rentality" target="_blank" rel="noopener noreferrer">
                  <Image src={warpcast} alt="" className="ml-1 w-[30px] mt-0.5" />
                </a>

                <a href="https://www.instagram.com/rentality_/" target="_blank" rel="noopener noreferrer">
                  <Image src={instagram} alt="" className="ml-3 w-[30px] mt-0.5" />
                </a>
              </div>
              <div className="flex mt-1">
                <a
                    href="https://medium.com/@rentality"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                  <Image src={medium} alt="" className="h-[24px] w-full" />
                </a>
              </div>
            </div>
            <div className="z-0 mt-8 sm:hidden">
              UIcons by <a href="https://www.flaticon.com/uicons">Flaticon</a>
            </div>
          </div>
          <div className="z-0 mt-auto font-['Montserrat',Arial,sans-serif]">©{moment().year()} by Rentality LLC</div>
        </div>
      </div>
    </footer>
  );
}
