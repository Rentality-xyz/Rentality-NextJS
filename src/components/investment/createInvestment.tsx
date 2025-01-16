import RntInput from "@/components/common/rntInput";
import {TFunction} from "@/utils/i18n";
import CarEditForm from "@/components/host/carEditForm/carEditForm";
import useCreateInvestCar from "@/hooks/host/useCreateInvestCar";
import {useState} from "react";
import { HostCarInfo } from "@/model/HostCarInfo";

/// TODO: checkInputs on correctness
export default function CreateCarInvestment({t}: { t: TFunction }) {
    const {createInvest} = useCreateInvestCar();
    const [carPrice, setCarPrice] = useState<number | string>(0);
    const [hostPercentage, setHostPercentage] = useState<number | string>(0);
    const [nftName, setNftName] = useState<string>("");
    const [nftSym, setNftSym] = useState<string>("");

    const handleInputCarPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setCarPrice(value === '' ? '' : Number.parseInt(value));
    };
    const handleHostPercentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setHostPercentage(value === '' ? '' : Number.parseInt(value));
    };
    return (
        <div >
            <div className="text-lg  mb-4 gap-4">
                <strong>{"Investment Info"}</strong>
            </div>
            <div className="flex flex-wrap gap-4">
                <RntInput
                    className="lg:w-60"
                    label={"Car price"}
                    placeholder="e.g. 10000"
                    value={carPrice}
                    onChange={handleInputCarPriceChange}
                />

                <RntInput
                    className="lg:w-60"
                    label={"Host percentage"}
                    placeholder="e.g. 1-100"
                    value={hostPercentage}
                    onChange={handleHostPercentsChange}
                />
            </div>
            <div className="text-lg  mb-4 gap-4">
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
                saveCarInfo={async (hostCarInfo: HostCarInfo) => {
                    let price = Number.parseInt(carPrice.toString())
                    let percents = Number.parseInt(hostPercentage.toString())
                    return await createInvest(hostCarInfo, price, percents, nftName, nftSym);
                }}
                t={t}
            />
        </div>
    );
}
