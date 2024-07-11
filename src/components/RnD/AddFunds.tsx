import { memo } from "react";
import AlchemyPayDeposit from "./AlchemyPay";

function AddFunds() {
  return (
    <div className="my-4 flex flex-col gap-4">
      <div className="text-lg mb-4">
        <strong>Add funds to your wallet</strong>
      </div>
      <AlchemyPayDeposit />
    </div>
  );
}

export default memo(AddFunds);