import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { GatewayStatus, useGateway } from "@civic/ethereum-gateway-react";
import { ethers } from "ethers";
import { useEffect, useRef, useState } from "react";

export type KycStatus =
  | "Loading"
  | "Not paid"
  | "Paying"
  | "Commission paid"
  | "Kyc passed"
  | "Kyc failed"
  | "Init error";

const useCustomCivic = () => {
  const rentalityContract = useRentality();
  const ethereumInfo = useEthereum();
  const [status, setStatus] = useState<KycStatus>("Loading");
  const [commissionFee, setCommissionFee] = useState(0);
  const { gatewayStatus, requestGatewayToken } = useGateway();
  const [isKycProcessing, setIsKycProcessing] = useState(false);
  const userUsedCommission = useRef<boolean>(false);

  async function payCommission() {
    if (!rentalityContract) {
      console.error("payCommission error: rentalityContract is null");
      return;
    }

    if (!(status === "Not paid" || status === "Kyc failed")) {
      console.error(`payCommission error: status is not "Not paid" nor "Kyc failed"`);
      return;
    }

    try {
      setStatus("Paying");

      const ethAddress = ethers.getAddress("0x0000000000000000000000000000000000000000");
      const commissionPrice = await rentalityContract.calculateKycCommission(ethAddress);
      const transaction = await rentalityContract.payKycCommission({
        value: commissionPrice.totalPrice,
      });
      await transaction.wait();

      setStatus("Commission paid");
      userUsedCommission.current = false;
    } catch (e) {
      console.error("payCommission error:" + e);
      setStatus("Not paid");
    }
  }

  useEffect(() => {
    const checkStatusChange = async () => {
      if (!rentalityContract) return;
      if (!ethereumInfo) return;

      if (gatewayStatus === GatewayStatus.ACTIVE) {
        setStatus("Kyc passed");
        return;
      }

      if (
        isKycProcessing &&
        (gatewayStatus === GatewayStatus.ERROR ||
          gatewayStatus === GatewayStatus.FROZEN ||
          gatewayStatus === GatewayStatus.LOCATION_NOT_SUPPORTED ||
          gatewayStatus === GatewayStatus.REJECTED ||
          gatewayStatus === GatewayStatus.REVOKED ||
          gatewayStatus === GatewayStatus.USER_INFORMATION_REJECTED ||
          gatewayStatus === GatewayStatus.VPN_NOT_SUPPORTED)
      ) {
        setStatus("Kyc failed");
        return;
      }

      if (gatewayStatus === GatewayStatus.IN_REVIEW && !isKycProcessing) {
        console.log(`KYC processing is started`);
        setIsKycProcessing(true);
        return;
      }

      if (userUsedCommission.current) return;

      if (isKycProcessing && gatewayStatus !== GatewayStatus.UNKNOWN && gatewayStatus !== GatewayStatus.IN_REVIEW) {
        try {
          userUsedCommission.current = true;
          const transaction = await rentalityContract.useKycCommissionForUser(ethereumInfo.walletAddress);
          await transaction.wait();
        } catch (e) {
          userUsedCommission.current = false;
          console.error("checkStatusChange error:" + e);
        }
      }
    };

    checkStatusChange();
  }, [rentalityContract, ethereumInfo, gatewayStatus, isKycProcessing]);

  //TODO DELETE THIS IS FOR DEBUG
  useEffect(() => {
    console.log(`gatewayStatus changed: ${gatewayStatus}`);
  }, [gatewayStatus]);

  async function requestKyc() {
    if (!rentalityContract) return;
    if (!ethereumInfo) return;
    if (status !== "Commission paid") return;
    if (!(await rentalityContract.isKycCommissionPaidForUser(ethereumInfo.walletAddress))) return;

    await requestGatewayToken();
  }

  const isInitialized = useRef<boolean>(false);
  useEffect(() => {
    const initialize = async () => {
      if (isInitialized.current) return;
      if (!rentalityContract) return;
      if (!ethereumInfo) return;

      try {
        isInitialized.current = true;

        const commissionPrice = await rentalityContract.getKycCommission();
        setCommissionFee(Number(commissionPrice) / 100);

        if (gatewayStatus === GatewayStatus.ACTIVE) {
          setStatus("Kyc passed");
          return;
        }

        if (await rentalityContract.isKycCommissionPaidForUser(ethereumInfo.walletAddress)) {
          setStatus("Commission paid");
          return;
        }

        if (
          gatewayStatus === GatewayStatus.NOT_REQUESTED ||
          gatewayStatus === GatewayStatus.COLLECTING_USER_INFORMATION
        ) {
          setStatus("Not paid");
          return;
        }

        setStatus("Kyc failed");
      } catch (e) {
        isInitialized.current = false;
        console.error("initialize error:" + e);
        setStatus("Init error");
      }
    };

    initialize();
  }, [rentalityContract, ethereumInfo, gatewayStatus]);

  return { status, commissionFee, payCommission, passKyc: requestKyc } as const;
};

export default useCustomCivic;
