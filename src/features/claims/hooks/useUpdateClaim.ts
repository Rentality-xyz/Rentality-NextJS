import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { Err, Ok, Result, TransactionErrorCode } from "@/model/utils/result";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { formatEther } from "viem";

const useUpdateClaim = () => {
  const { rentalityContracts } = useRentality();
  const ethereumInfo = useEthereum();

  async function payClaim(claimId: number): Promise<Result<boolean, TransactionErrorCode>> {
    if (!ethereumInfo) {
      console.error("payClaim error: ethereumInfo is null");
      return Err("ERROR");
    }

    if (!rentalityContracts) {
      console.error("payClaim error: rentalityContract is null");
      return Err("ERROR");
    }

    try {
      const claimAmountInWeth = await rentalityContracts.gateway.calculateClaimValue(BigInt(claimId));
      const claimAmountInEth = Number(formatEther(claimAmountInWeth));

      if (!(await isUserHasEnoughFunds(ethereumInfo.signer, claimAmountInEth))) {
        console.error("payClaim error: user don't have enough funds");
        return Err("NOT_ENOUGH_FUNDS");
      }

      const transaction = await rentalityContracts.gateway.payClaim(BigInt(claimId), {
        value: claimAmountInWeth,
      });

      await transaction.wait();
      return Ok(true);
    } catch (e) {
      console.error("payClaim error:" + e);
      return Err("ERROR");
    }
  }

  async function cancelClaim(claimId: number): Promise<Result<boolean, TransactionErrorCode>> {
    if (!ethereumInfo) {
      console.error("cancelClaim error: ethereumInfo is null");
      return Err("ERROR");
    }

    if (!rentalityContracts) {
      console.error("cancelClaim error: rentalityContract is null");
      return Err("ERROR");
    }

    if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
      console.error("cancelClaim error: user don't have enough funds");
      return Err("NOT_ENOUGH_FUNDS");
    }

    try {
      const transaction = await rentalityContracts.gateway.rejectClaim(BigInt(claimId));
      await transaction.wait();
      return Ok(true);
    } catch (e) {
      console.error("cancelClaim error:" + e);
      return Err("ERROR");
    }
  }

  return {
    payClaim,
    cancelClaim,
  } as const;
};

export default useUpdateClaim;
