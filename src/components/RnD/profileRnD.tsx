import { memo } from "react";
import AlchemyPayDeposit from "./AlchemyPay";

function ProfileRnD() {
  return (
    <div className="my-4 flex flex-col gap-4">
      <div className="text-lg mb-4">
        <strong>RnD logic</strong>
      </div>
      <div className="flex flex-col gap-4">
        <AlchemyPayDeposit />
      </div>
    </div>
  );
}

export default memo(ProfileRnD);
