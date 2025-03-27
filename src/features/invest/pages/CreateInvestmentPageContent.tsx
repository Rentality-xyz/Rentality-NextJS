import CarEditForm from "@/components/host/carEditForm/carEditForm";
import useCreateInvestCar from "@/features/invest/hooks/useCreateInvestCar";
import { useEffect, useState } from "react";
import { HostCarInfo, isUnlimitedMiles } from "@/model/HostCarInfo";
import { useTranslation } from "react-i18next";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import useFetchPlatformPercentage from "../hooks/useFetchPercentage";

function CreateInvestmentPageContent() {
  const [carPrice, setCarPrice] = useState<number | string>(0);
  const [hostPercentage, setHostPercentage] = useState<number | string>(0);
  const { mutateAsync: createInvest } = useCreateInvestCar();
  const { t } = useTranslation();
  const { data: platformPercentage } = useFetchPlatformPercentage();
  const [investorsPercentage, setInvestorsPercentage] = useState<number | string>(0);

  const handleInputCarPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCarPrice(value === "" ? "" : Number.parseInt(value));
  };

  const handleHostPercentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHostPercentage(value === "" ? "" : Number.parseInt(value));
  };

  useEffect(() => {
    setInvestorsPercentage((100 - Number(platformPercentage) - Number(hostPercentage)).toFixed(2));
  }, [hostPercentage]);

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

        <RntInputTransparent
          className="lg:w-60"
          label={"Platform percentage"}
          placeholder="0"
          readOnly={true}
          value={platformPercentage}
        />

        <RntInputTransparent
          className="lg:w-60"
          label={"Investors percentage"}
          placeholder="0"
          readOnly={true}
          value={investorsPercentage}
        />
      </div>
      <div className="mb-4 gap-4 pl-4 text-lg text-[#FFFFFF70]">{t("invest.new_nft_info")}</div>
      <CarEditForm
        isNewCar={true}
        isInvestmentCar={true}
        saveCarInfo={async (hostCarInfo: HostCarInfo, nftName, nftSym) => {
          let price = Number.parseInt(carPrice.toString());
          let percents = Number.parseInt(hostPercentage.toString());
          return await createInvest({
            images: hostCarInfo.images,
            brand: hostCarInfo.brand,
            model: hostCarInfo.model,
            releaseYear: hostCarInfo.releaseYear,
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

export default CreateInvestmentPageContent;
