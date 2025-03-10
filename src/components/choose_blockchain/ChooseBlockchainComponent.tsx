import { Button, Stack } from "@mui/material";
import Image from "next/image";
import { ElementRef, useEffect, useRef, useState } from "react";
import { assertIsNode } from "@/utils/react";
import { getExistBlockchainList } from "@/model/blockchain/blockchainList";
import { useEthereum } from "@/contexts/web3/ethereumContext";

export default function ChooseBlockchainComponent() {
  const classBtn: string = "w-full text-base font-semibold text-white normal-case font-['Montserrat',Arial,sans-serif]";

  const [isShowComponentList, setIsShowComponentList] = useState(false);
  const [selectedChainId, setSelectedChainId] = useState(-1);
  const ethereumInfo = useEthereum();
  const chooseBlockchainWrapperRef = useRef<ElementRef<"div">>(null);
  const selectedBlockchain = getExistBlockchainList().find((i) => i.chainId === selectedChainId);

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
      if (!ethereumInfo) return;

      const chainId = ethereumInfo.chainId;

      if (selectedChainId !== chainId) {
        setSelectedChainId(chainId);
      }
    };

    getChainId();
  }, [ethereumInfo, selectedChainId]);

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

  const getLogoIconUrl = (logoFileName: string) => {
    if (!logoFileName) return "/logos/chainLogoUnknown.svg";
    return `/logos/${logoFileName}`;
  };

  return (
    <div ref={chooseBlockchainWrapperRef}>
      <Stack className="relative xl:ml-16" direction="row" spacing={1} alignItems="center">
        <Button
          className="flex"
          onClick={() => {
            setIsShowComponentList((prev) => !prev);
          }}
        >
          <Image
            className={`h-8 w-8 rounded-[0.6rem] bg-[#DCE3FA]`}
            src={getLogoIconUrl(selectedBlockchain?.logo ?? "")}
            alt=""
            width={32}
            height={32}
          />
          <Image src={isShowComponentList ? "/images/icons/arrows/arrowUp.svg" : "/images/icons/arrows/arrowDown.svg"} height={20} width={20} alt="" className="ml-1" />
        </Button>
        {isShowComponentList && (
          <div className="absolute left-auto right-0 top-[2.5rem] z-50 w-[220px] rounded-xl border-2 border-[#373737] bg-[#1E1E30]">
            {getExistBlockchainList().map((i) => {
              return (
                <Button
                  key={i.chainId}
                  className={classBtn}
                  onClick={async () => {
                    await ethereumInfo?.requestChainIdChange(i.chainId);
                    setIsShowComponentList((prev) => !prev);
                  }}
                >
                  <Image
                    className="mr-2 h-[24px] w-[24px]"
                    src={getLogoIconUrl(i.logo)}
                    alt=""
                    width={24}
                    height={24}
                  />
                  <span className="whitespace-nowrap">{i.shortName}</span>
                  <div className="flex w-full items-end">
                    {selectedBlockchain == i && <Image src={"/images/icons/blockchainChosen.svg"} width={20} height={20} alt="" className="mr-0" />}
                  </div>
                </Button>
              );
            })}
          </div>
        )}
      </Stack>
    </div>
  );
}
