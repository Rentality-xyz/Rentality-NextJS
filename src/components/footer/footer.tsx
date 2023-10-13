import Image from "next/image";
import logo from "../../images/logo.png";
import bgCar from "../../images/red-generic-sport-ca.png";
import linkedin from "../../images/icons8-linkedin-50.png";
import twitter from "../../images/icons8-twitter-50.png";
import discord from "../../images/icons8-discord-50.png";
import {Input} from "postcss";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[url('../images/bg-gradient-flip.jpg')] bg-cover bg-no-repeat bg-center bg-scroll relative max-sm:h-[780px] h-[680px] xl:h-[520px]">
        <Image src={bgCar} alt="" className="absolute bottom-0 left-0"/>
        <div className = "absolute bottom-0 left-4 sm:hidden text-white font-['Montserrat',Arial,sans-serif]">
            ©2023 by Rentality LLC
        </div>
        <div id={"footer-content"} className = "text-white max-w-[1192px] mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:h-full">

            <div id={"footer-info-block"} className = "flex flex-col pt-[70px] max-sm:mx-auto sm:w-full h-full">
                <Image src={logo} alt="" className="max-w-[200px] min-w-[200px] h-auto"/>
                <div>
                    <div className = "pt-4 sm:pt-9 font-['Montserrat',Arial,sans-serif] text-3xl font-normal">info@rentality.xyz</div>
                    <div className = "flex mt-2 w-[232px]">
                        <a
                            href="https://www.linkedin.com/company/rentalitycorp/?viewAsMember=true"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Image src={linkedin} alt="" className="w-[30px]"/>
                        </a>

                        <a
                            href="https://twitter.com/Rentality_Info"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Image src={twitter} alt="" className="ml-3 w-[30px]"/>
                        </a>

                        <a
                            href="https://discord.gg/QRu86bTRA6e"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Image src={discord} alt="" className="ml-3 w-[30px]"/>
                        </a>

                    </div>
                </div>
            </div>

            <div id={"footer-communic-block"} className = "pt-4 sm:pt-[70px] w-full">
                <div className = "text-xl font-semibold pb-[30px]">Let Us Contact You</div>
                <form>
                    <div>
                        <div id={"input-name"} className = "pb-5">
                            <input type={"text"} className={"pl-5 pr-5 bg-black h-[50px] text-base rounded-lg w-full"} placeholder={"Name"}/>
                        </div>
                        <div id={"input-email"} className = "pb-5">
                            <input type={"text"} className={"pl-5 pr-5 bg-black h-[50px] text-base rounded-lg w-full"} placeholder={"Email"}/>
                        </div>
                        <div id={"input-phone"} className = "pb-5">
                            <input type={"text"} className={"pl-5 pr-5 bg-black h-[50px] text-base rounded-lg w-full"} placeholder={"+1(999) 999-9999"}/>
                        </div>
                    </div>
                    <button type={"submit"} className = "bg-white text-[#7833fb] hover:text-[#0b1019] pt-0 pb-0 pl-4 pr-4 w-[160px] h-[50px] rounded-[10px] text-xl font-['Montserrat',Arial,sans-serif] font-semibold">
                        Submit →
                    </button>
                </form>
            </div>

            <div className = "mt-auto font-['Montserrat',Arial,sans-serif] max-sm:hidden">
                ©2023 by Rentality LLC
            </div>
        </div>
    </footer>
  );
}
