import { Button, Stack } from "@mui/material";
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
import { useEffect, useRef, useState } from "react";
import { assertIsNode } from "@/utils/react";
import { useRentality } from "@/contexts/rentalityContext";
import { blockchainList } from "@/model/blockchain/BlockchainList";

export default function ChooseBlockchainComponent() {
  const classBtn: string = "w-full text-base font-semibold text-white normal-case font-['Montserrat',Arial,sans-serif]";

  const [isShowComponentList, setIsShowComponentList] = useState(false);
  const [selectedChainId, setSelectedChainId] = useState(-1);
  const rentalityInfo = useRentality();
  const chooseBlockchainWrapperRef = useRef<HTMLDivElement>(null);
  const selectedBlockchain = blockchainList.find((i) => i.chainId === selectedChainId);

  useEffect(() => {
    window.addEventListener("scroll", handleOnScroll, true);
    window.addEventListener("click", handleOnOutsideClick);

    return () => {
      window.removeEventListener("scroll", handleOnScroll, true);
      window.removeEventListener("click", handleOnOutsideClick);
    };
  }, []);

  useEffect(() => {
    const getChainId = async () => {
      if (!rentalityInfo) return;

      const chainId = await rentalityInfo?.signer.getChainId();
      if (selectedChainId !== chainId) {
        setSelectedChainId(chainId);
      }
    };

    getChainId();
  }, [rentalityInfo, selectedChainId]);

  const handleOnScroll = (event: Event) => {
    if (event.target === document || event.target === document.documentElement || event.target === document.body) {
      setIsShowComponentList(false);
    }
  };

  const handleOnOutsideClick = (event: MouseEvent) => {
    assertIsNode(event.target);
    if (chooseBlockchainWrapperRef.current?.contains(event.target)) return;
    setIsShowComponentList(false);
  };

  const getLogoIcon = (chainId: number, addBackground: boolean) => {
    switch (chainId) {
      case 123:
        return addBackground ? logoFuse : logoFuse;
      case 80001:
        return addBackground ? logoPolygonBg : logoPolygon;
      case 84532:
        return addBackground ? logoBaseBg : logoBase;
      case 11155111:
        return addBackground ? logoEthereumBg : logoEthereum;
      default:
        return logoEthereum;
    }
  };
  return (
    <div ref={chooseBlockchainWrapperRef}>
      <Stack className="mx-1 xl:ml-16 relative" direction="row" spacing={1} alignItems="center">
        <Button
          className="flex"
          onClick={() => {
            setIsShowComponentList((prev) => !prev);
          }}
        >
          <Image className="w-8 h-8" src={getLogoIcon(selectedBlockchain?.chainId ?? 0, true)} alt="" />
          <Image src={isShowComponentList ? arrowUp : arrowDown} alt="" className="ml-1" />
        </Button>
        {isShowComponentList && (
          <Stack className="w-[220px] absolute top-[2.5rem] left-auto right-0 z-50 bg-[#1E1E30] rounded-xl border-2 border-[#373737]">
            {blockchainList.map((i) => {
              return (
                <Button
                  key={i.chainId}
                  className={classBtn}
                  onClick={async () => {
                    // console.log("requestChainIdChange call with:" + i.chainIdHexString);
                    // console.log("rentalityInfo:", rentalityInfo);
                    await rentalityInfo?.requestChainIdChange(i.chainIdHexString);
                    setIsShowComponentList((prev) => !prev);
                  }}
                >
                  <Image className=" mr-2 w-[24px] h-[24px]" src={getLogoIcon(i.chainId, false)} alt="" />
                  <span className="whitespace-nowrap">{i.shortName}</span>
                  <Stack className="w-full flex items-end">
                    {selectedBlockchain == i && <Image src={blockchainChosen} alt="" className="mr-0" />}
                  </Stack>
                </Button>
              );
            })}
            {/* 
            <Button
              className={classBtn}
              onClick={() => {
                rentalityInfo?.requestChainIdChange("0xaa36a7");
                setIsShowComponentList((prev) => !prev);
              }}
            >
              <Image src={logoEthereum} alt="" className="mr-1" />
              Sepolia
              <Stack className="w-full flex items-end">
                {selectedBlockchain == BlockchainsEnum.ETHEREUM && (
                  <Image src={blockchainChosen} alt="" className="mr-0" />
                )}
              </Stack>
            </Button>
            <Button
              className={classBtn}
              onClick={() => {
                toggleBlockchain(BlockchainsEnum.POLYGON);
                setIsShowComponentList((prev) => !prev);
              }}
            >
              <Image src={logoPolygon} alt="" className="mr-1" />
              Polygon
              <Stack className="w-full flex items-end">
                {selectedBlockchain == BlockchainsEnum.POLYGON && (
                  <Image src={blockchainChosen} alt="" className="mr-0" />
                )}
              </Stack>
            </Button>
            <Button
              className={classBtn}
              onClick={() => {
                toggleBlockchain(BlockchainsEnum.BASE);
                setIsShowComponentList((prev) => !prev);
              }}
            >
              <Image src={logoBase} alt="" className="mr-1" />
              Base
              <Stack className="w-full flex items-end">
                {selectedBlockchain == BlockchainsEnum.BASE && <Image src={blockchainChosen} alt="" className="mr-0" />}
              </Stack>
            </Button>
            <Button
              className={classBtn}
              onClick={() => {
                toggleBlockchain(BlockchainsEnum.FUSE);
                setIsShowComponentList((prev) => !prev);
              }}
            >
              <Image src={logoFuse} alt="" className="ml-0.5 mr-2 w-[24px] xl:w-[14px]" />
              Fuse
              <Stack className="w-full flex items-end">
                {selectedBlockchain == BlockchainsEnum.FUSE && <Image src={blockchainChosen} alt="" className="mr-0" />}
              </Stack>
            </Button> */}
          </Stack>
        )}
      </Stack>
    </div>
  );
}
