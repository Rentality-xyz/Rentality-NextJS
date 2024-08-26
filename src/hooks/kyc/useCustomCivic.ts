import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { Err, Ok, Result } from "@/model/utils/result";
import { ETH_DEFAULT_ADDRESS } from "@/utils/constants";
import { tryParseMetamaskError } from "@/utils/metamask";
import { isEmpty } from "@/utils/string";
import { GatewayStatus, useGateway } from "@civic/ethereum-gateway-react";
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
  const { gatewayStatus, requestGatewayToken, pendingRequests } = useGateway();
  const [isKycProcessing, setIsKycProcessing] = useState(false);
  const userUsedCommission = useRef<boolean>(false);
  const isFetchingPiiData = useRef<boolean>(false);

  useEffect(() => {
    const getInfo = async () => {
      console.log(`KycVerification pendingRequests: ${JSON.stringify(pendingRequests)}`);

      if (!pendingRequests) return;
      if (isFetchingPiiData.current) return;
      if (isEmpty(pendingRequests.presentationRequestId)) return;

      isFetchingPiiData.current = true;
      try {
        var url = new URL(`/api/retrieveCivicData`, window.location.origin);
        url.searchParams.append("requestId", pendingRequests.presentationRequestId);

        console.log(`calling retrieveCivicData...`);

        const apiResponse = await fetch(url);

        if (!apiResponse.ok) {
          console.error(`getInfo fetch error: + ${apiResponse.statusText}`);
          return;
        }
      } finally {
        isFetchingPiiData.current = false;
      }
    };
    getInfo();
  }, [pendingRequests]);

  async function payCommission(): Promise<Result<boolean, string>> {
    if (!rentalityContract) {
      console.error("payCommission error: rentalityContract is null");
      return Err("rentalityContract is null");
    }

    if (!(status === "Not paid" || status === "Kyc failed")) {
      console.error(`payCommission error: status is not "Not paid" nor "Kyc failed"`);
      return Err(`status is not "Not paid" nor "Kyc failed"`);
    }

    try {
      setStatus("Paying");

      const commissionPrice = await rentalityContract.calculateKycCommission(ETH_DEFAULT_ADDRESS);
      const transaction = await rentalityContract.payKycCommission(ETH_DEFAULT_ADDRESS, { value: commissionPrice });
      await transaction.wait();

      setStatus("Commission paid");
      userUsedCommission.current = false;
      return Ok(true);
    } catch (e) {
      const metamaskErrorResult = tryParseMetamaskError(e);
      if (metamaskErrorResult.ok && metamaskErrorResult.value.message.includes("insufficient funds")) {
        setStatus("Not paid");
        return Err("You're almost there! Just add a little more to your wallet to continue.");
      }
      console.error("payCommission error:" + e);
      setStatus("Not paid");
      return Err("Transaction error. See logs for more details");
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
          const transaction = await rentalityContract.useKycCommission(ethereumInfo.walletAddress);
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
    console.debug(`gatewayStatus changed: ${gatewayStatus}`);
  }, [gatewayStatus]);

  async function requestKyc() {
    if (!rentalityContract) return;
    if (!requestGatewayToken) return;
    if (!ethereumInfo) return;
    if (status !== "Commission paid") return;
    if (!(await rentalityContract.isKycCommissionPaid(ethereumInfo.walletAddress))) return;

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

        if (await rentalityContract.isKycCommissionPaid(ethereumInfo.walletAddress)) {
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
