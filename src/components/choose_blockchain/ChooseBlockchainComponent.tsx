import {Button, Stack} from "@mui/material";
import logoEthereum from "../../images/logoEthereum.svg";
import logoEthereumBg from "../../images/logoEthereumBg.svg";
import arrowUp from "../../images/arrowUp.svg";
import arrowDown from "../../images/arrowDown.svg";
import logoPolygon from "../../images/logoPolygon.svg";
import logoPolygonBg from "../../images/logoPolygonBg.svg";
import logoBase from "../../images/logoBase.svg";
import logoBaseBg from "../../images/logoBaseBg.svg";
import logoFuse from "../../images/logoFuse.png";
import blockchainChosen from "../../images/blockchainChosen.svg";
import Image from "next/image";
import {useState} from "react";
import {BlockchainsEnum} from "@/model/blockchain/BlockchainsEnum";
import {useAppContext} from "@/contexts/useAppContext";

export default function ChooseBlockchainComponent() {
    const classBtn: string = "w-full text-base font-semibold text-white normal-case font-['Montserrat',Arial,sans-serif]"

    const [isHideChooseBlockchain, setIsHideChooseBlockchain] = useState(false);
    const { selectedBlockchain, toggleBlockchain } = useAppContext();

    return (
        <Stack className="mx-1 xl:ml-16 relative" direction="row" spacing={1} alignItems="center">
            <Button
                className="flex"
                onClick={() => {
                    setIsHideChooseBlockchain((prev) => !prev);
                }}
            >
                {selectedBlockchain == BlockchainsEnum.ETHEREUM && (
                    <Image src={logoEthereumBg} alt=""/>
                )}

                {selectedBlockchain == BlockchainsEnum.POLYGON && (
                    <Image src={logoPolygonBg} alt=""/>
                )}

                {selectedBlockchain == BlockchainsEnum.BASE && (
                    <Image src={logoBaseBg} alt=""/>
                )}

                {selectedBlockchain == BlockchainsEnum.FUSE && (
                    <Image src={logoFuse} alt=""/>
                )}
                <Image src={isHideChooseBlockchain ? arrowUp : arrowDown} alt="" className="ml-1"/>
            </Button>
            {isHideChooseBlockchain && (
                <Stack className="w-[200px] absolute top-[2.3rem] left-auto right-0 z-50 bg-[#1E1E30] rounded-xl border-2 border-[#373737]">
                    <Button
                        className={classBtn}
                        onClick={() => {
                            toggleBlockchain(BlockchainsEnum.ETHEREUM);
                            setIsHideChooseBlockchain((prev) => !prev);
                        }}
                    >
                        <Image src={logoEthereum} alt="" className="mr-1"/>
                        Ethereum
                        <Stack className="w-full flex items-end">
                            {selectedBlockchain == BlockchainsEnum.ETHEREUM && (
                                <Image src={blockchainChosen} alt="" className="mr-0"/>
                            )}
                        </Stack>
                    </Button>
                    <Button
                        className={classBtn}
                        onClick={() => {
                            toggleBlockchain(BlockchainsEnum.POLYGON);
                            setIsHideChooseBlockchain((prev) => !prev);
                        }}
                    >
                        <Image src={logoPolygon} alt="" className="mr-1"/>
                        Polygon
                        <Stack className="w-full flex items-end">
                            {selectedBlockchain == BlockchainsEnum.POLYGON && (
                                <Image src={blockchainChosen} alt="" className="mr-0"/>
                            )}
                        </Stack>

                    </Button>
                    <Button
                        className={classBtn}
                        onClick={() => {
                            toggleBlockchain(BlockchainsEnum.BASE);
                            setIsHideChooseBlockchain((prev) => !prev);
                        }}
                    >
                        <Image src={logoBase} alt="" className="mr-1"/>
                        Base
                        <Stack className="w-full flex items-end">
                            {selectedBlockchain == BlockchainsEnum.BASE && (
                                <Image src={blockchainChosen} alt="" className="mr-0"/>
                            )}
                        </Stack>

                    </Button>
                    <Button
                        className={classBtn}
                        onClick={() => {
                            toggleBlockchain(BlockchainsEnum.FUSE);
                            setIsHideChooseBlockchain((prev) => !prev);
                        }}
                    >
                        <Image src={logoFuse} alt="" className="ml-0.5 mr-2 w-[24px] xl:w-[14px]"/>
                        Fuse
                        <Stack className="w-full flex items-end">
                            {selectedBlockchain == BlockchainsEnum.FUSE && (
                                <Image src={blockchainChosen} alt="" className="mr-0"/>
                            )}
                        </Stack>

                    </Button>
                </Stack>
            )}
        </Stack>
    );
}
