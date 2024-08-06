import RntInput from "@/components/common/rntInput";
import { TFunction } from "@/utils/i18n";
import CarEditForm from "@/components/host/carEditForm/carEditForm";
import useCreateInvestCar from "@/hooks/host/useCreateInvestCar";
import { useState } from "react";

/// TODO: checkInputs on correctness
export default function CreateCarInvestment({ t }: { t: TFunction }) {
  const { createInvest } = useCreateInvestCar();
  const [carPrice, setCarPrice] = useState<number>(0);
  const [hostPercentage, setHostPercentage] = useState<number>(0);
  const [nftName, setNftName] = useState<string>("");
  const [nftSym, setNftSym] = useState<string>("");
  return (
    <div>
      <div className="text-lg  mb-4">
        <strong>{"Investment Info"}</strong>
      </div>
      <div className="flex flex-wrap gap-4">
        <RntInput
          className="lg:w-60"
          id="pricePerDay"
          label={"Car price"}
          placeholder="e.g. 10000"
          value={carPrice}
          onChange={(value) => setCarPrice(Number.parseInt(value.target.value))}
        />
        <RntInput
          className="lg:w-60"
          id="securityDeposit"
          label={"Host percentage"}
          placeholder="e.g. 1-100"
          value={hostPercentage}
          onChange={(value) => setHostPercentage(Number.parseInt(value.target.value))}
        />
      </div>
      <div className="text-lg  mb-4">
        <strong>{"New nft collection info"}</strong>
      </div>
      <div className="flex flex-wrap gap-4">
        <RntInput
          className="lg:w-60"
          id="pricePerDay"
          label={"NFT name"}
          placeholder="e.g. MyNft"
          value={nftName}
          onChange={(value) => setNftName(value.target.value)}
        />
        <RntInput
          className="lg:w-60"
          id="securityDeposit"
          label={"NFT symbol"}
          placeholder="e.g. SYM"
          value={nftSym}
          onChange={(value) => setNftSym(value.target.value)}
        />
      </div>
      <CarEditForm
        isNewCar={true}
        saveCarInfo={async (hostCarInfo, image) => {
          return await createInvest(hostCarInfo, image, carPrice, hostPercentage, nftName, nftSym);
        }}
        t={t}
      />
    </div>
  );
}
