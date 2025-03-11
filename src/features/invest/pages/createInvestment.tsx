import CarEditForm from "@/components/host/carEditForm/carEditForm";
import useCreateInvestCar from "@/hooks/host/useCreateInvestCar";
import { useState } from "react";
import { HostCarInfo } from "@/model/HostCarInfo";
import { useTranslation } from "react-i18next";
import RntInputTransparent from "@/components/common/rntInputTransparent";

/// TODO: checkInputs on correctness
export default function CreateCarInvestment() {
  const { t } = useTranslation();
  const { mutateAsync: createInvest } = useCreateInvestCar();
  const [carPrice, setCarPrice] = useState<number | string>(0);
  const [hostPercentage, setHostPercentage] = useState<number | string>(0);
  const [nftName, setNftName] = useState<string>("");
  const [nftSym, setNftSym] = useState<string>("");

  const handleInputCarPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCarPrice(value === "" ? "" : Number.parseInt(value));
  };
  const handleHostPercentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setHostPercentage(value === "" ? "" : Number.parseInt(value));
  };
  return (
    <div>
      <div className="mb-4 gap-4 text-lg">
        <strong>{"Investment Info"}</strong>
      </div>
      <div className="flex flex-wrap gap-4">
        <RntInputTransparent
          className="lg:w-60"
          label={"Car price"}
          placeholder="e.g. 10000"
          value={carPrice}
          onChange={handleInputCarPriceChange}
        />

        <RntInputTransparent
          className="lg:w-60"
          label={"Host percentage"}
          placeholder="e.g. 1-100"
          value={hostPercentage}
          onChange={handleHostPercentsChange}
        />
      </div>
      <div className="mb-4 gap-4 text-lg text-[#FFFFFF70]">{t("invest.new_nft_info")}</div>
      <div className="flex flex-wrap gap-4">
        <RntInputTransparent
          className="lg:w-60"
          id="pricePerDay"
          label={"NFT name"}
          placeholder="e.g. MyNft"
          disabled={true}
          value={nftName}
          onChange={(value) => setNftName(value.target.value)}
        />
        <RntInputTransparent
          className="lg:w-60"
          id="securityDeposit"
          label={"NFT symbol"}
          placeholder="e.g. SYM"
          disabled={true}
          value={nftSym}
          onChange={(value) => setNftSym(value.target.value)}
        />
      </div>
      <div className="mb-4 gap-4 text-lg text-[#FFFFFF70]">{t("invest.generated_automatically")}</div>
      <CarEditForm
        isNewCar={true}
        isInvestmentCar={true}
        saveCarInfo={async (hostCarInfo: HostCarInfo) => {
          let price = Number.parseInt(carPrice.toString());
          let percents = Number.parseInt(hostPercentage.toString());
          return await createInvest({
            hostCarInfo,
            carPrice: price,
            hostPercents: percents,
            nftName,
            nftSym,
          });
        }}
        t={t}
      />
    </div>
  );
}
