import Image from "next/image";
import logo from "../../images/logo.png";
import bgCar from "../../images/red-generic-sport-ca.png";
import linkedin from "../../images/ic-linkedin-50.png";
import twitter from "../../images/ic_twitter.svg";
import discord from "../../images/ic-discord-50.png";
import email from "../../images/ic-email-50.png";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[url('../images/bg-gradient-flip.jpg')] bg-cover bg-no-repeat bg-center bg-scroll relative h-[500px] min-[500px]:h-[350px] min-[560px]:h-[450px] lg:h-[290px]">
      <Image src={bgCar} alt="" className="absolute bottom-0 left-0" />
      <div id={"footer-content"} className="text-white max-w-[1192px] mx-auto flex flex-col sm:flex-row h-full">
        <div
          id="footer-legal-matters"
          className="flex flex-col pt-[30px] lg:pt-[40px] max-lg:mx-auto lg:ml-[540px] min-[1536px]:ml-[540px] min-[1720px]:ml-auto w-max h-1/3 sm:h-full"
        >
          <strong className="pb-1 text-xl font-semibold font-['Montserrat',Arial,sans-serif]">Legal matters</strong>
          <Link
            href="https://rentality.xyz/legalmatters/terms"
            target="_blank"
            className="pb-1.5 pl-4 cursor-pointer text-base font-['Montserrat',Arial,sans-serif] hover:underline"
          >
            <strong>Terms of service</strong>
          </Link>
          <Link
            href="https://rentality.xyz/legalmatters/cancellation"
            target="_blank"
            className="pb-1.5 pl-4 cursor-pointer text-base font-['Montserrat',Arial,sans-serif] hover:underline"
          >
            <strong>Cancellation policy</strong>
          </Link>
          <Link
            href="https://rentality.xyz/legalmatters/prohibiteduses"
            target="_blank"
            className="pb-1.5 pl-4 cursor-pointer text-base font-['Montserrat',Arial,sans-serif] hover:underline"
          >
            <strong>Prohibited uses</strong>
          </Link>
          <Link
            href="https://rentality.xyz/legalmatters/privacy"
            target="_blank"
            className="pb-1.5 pl-4 cursor-pointer text-base font-['Montserrat',Arial,sans-serif] hover:underline"
          >
            <strong>Privacy policy</strong>
          </Link>
        </div>

        <div
          id={"footer-info-block"}
          className="flex flex-col pt-[30px] lg:pt-[40px] max-lg:mx-auto lg:ml-auto w-max h-full"
        >
          <Image src={logo} alt="" className="max-w-[200px] min-w-[200px] h-auto" />
          <div>
            <a
              href="mailto:info@rentality.xyz"
              className="max-lg:hidden pt-4 lg:pt-9 font-['Montserrat',Arial,sans-serif] text-3xl font-normal"
            >
              <div>info@rentality.xyz</div>
            </a>

            <div className="flex mt-2 w-[232px]">
              <a
                href="https://www.linkedin.com/company/rentalitycorp/?viewAsMember=true"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image src={linkedin} alt="" className="w-[30px]" />
              </a>

              <a href="https://twitter.com/Rentality_Info" target="_blank" rel="noopener noreferrer">
                <Image src={twitter} alt="" className="ml-3 w-[22px] mt-1" />
              </a>

              <a href="https://discord.gg/rentality" target="_blank" rel="noopener noreferrer">
                <Image src={discord} alt="" className="ml-3 w-[30px]" />
              </a>

              <a href="mailto:info@rentality.xyz" className="lg:hidden">
                <Image src={email} alt="" className="ml-3 w-[30px]" />
              </a>
            </div>
          </div>
          <div className="mt-auto font-['Montserrat',Arial,sans-serif]">©2023 by Rentality LLC</div>
        </div>
      </div>
    </footer>
  );
}
