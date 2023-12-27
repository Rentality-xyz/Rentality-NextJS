import Image from "next/image";
import logo from "../../images/logo.png";
import bgCar from "../../images/red-generic-sport-ca.png";
import linkedin from "../../images/ic-linkedin-50.png";
import twitter from "../../images/ic_twitter.svg";
import discord from "../../images/ic-discord-50.png";
import email from "../../images/ic-email-50.png";

export default function Footer() {
  return (
    <footer className="bg-[url('../images/bg-gradient-flip.jpg')] bg-cover bg-no-repeat bg-center bg-scroll relative h-[320px] min-[500px]:h-[350px] min-[560px]:h-[400px] lg:h-[290px]">
      <Image src={bgCar} alt="" className="absolute bottom-0 left-0" />
      <div
        id={"footer-content"}
        className="text-white max-w-[1192px] mx-auto px-4 flex flex-col h-full"
      >
        <div id={"footer-info-block"} className="flex flex-col pt-[30px] lg:pt-[40px] max-lg:mx-auto lg:ml-auto w-max h-full">
          <Image src={logo} alt="" className="max-w-[200px] min-w-[200px] h-auto" />
          <div>
            <a
                href="mailto:info@rentality.xyz"
                className="max-lg:hidden pt-4 lg:pt-9 font-['Montserrat',Arial,sans-serif] text-3xl font-normal"
            >
              <div>
                info@rentality.xyz
              </div>
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

              <a href="https://discord.gg/QRu86bTRA6e" target="_blank" rel="noopener noreferrer">
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
