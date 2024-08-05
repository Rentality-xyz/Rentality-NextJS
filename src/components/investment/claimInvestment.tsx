import {SearchCarInfo} from "@/model/SearchCarsResult";
import RntButton from "../common/rntButton";
import {Avatar} from "@mui/material";
import {useMemo, useState} from "react";
import {displayMoneyWith2Digits} from "@/utils/numericFormatters";
import {useRntDialogs} from "@/contexts/rntDialogsContext";
import SearchCarDeliveryExtraInfo from "../search/searchCarDeliveryExtraInfo";

type TFunction = (key: string, options?: { [key: string]: any }) => string;

export default function ClaimInvestment({
                                      searchInfo,
                                      handleRentCarRequest,
                                      disableButton,
                                      isSelected,
                                      setSelected,
                                      t,
                                  }: {
    searchInfo: SearchCarInfo;
    handleRentCarRequest: (carInfo: SearchCarInfo) => void;
    disableButton: boolean;
    isSelected: boolean;
    setSelected: (carID: number) => void;
    t: TFunction;
}) {
    const {showCustomDialog, hideDialogs} = useRntDialogs();
    let [valueLeft, setValue] = useState(searchInfo.pricePerDayWithDiscount)
    let [investAmount, setInvestAmount] = useState(0)

    const handleInputChange = (event) => {
        setInvestAmount(event.target.value);
    };
    const t_item: TFunction = (name, options) => {
        return t("car_search_item." + name, options);
    };

    const mainClasses = useMemo(() => {
        const classNames = "bg-rentality-bg rnt-card flex flex-col md:flex-row rounded-xl overflow-hidden cursor-pointer";
        return isSelected ? classNames + " border-2" : classNames;
    }, [isSelected]);

    const handleInfoClick = () => {
        showCustomDialog(
            <SearchCarDeliveryExtraInfo
                hostHomeLocation={searchInfo.hostHomeLocation}
                deliveryPrices={{
                    from1To25milesPrice: searchInfo.deliveryPrices.from1To25milesPrice,
                    over25MilesPrice: searchInfo.deliveryPrices.over25MilesPrice,
                }}
                isInsuranceIncluded={searchInfo.isInsuranceIncluded}
                handleClose={hideDialogs}
                t={t}
            />
        );
    };

    return (
        <div className={mainClasses} onClick={() => setSelected(searchInfo.carId)}>
            {/* <div className="w-60 h-full min-h-[14rem] flex-shrink-0">
        <Image
          src={searchInfo.image}
          alt=""
          width={1000}
          height={1000}
          className="h-full w-full object-cover"
        />
      </div> */}
            <div
                style={{backgroundImage: `url(${searchInfo.image})`}}
                className="relative w-full md:w-64 min-h-[12rem] flex-shrink-0 bg-center bg-cover"
            >
                {searchInfo.isCarDetailsConfirmed && (
                    <i className="fi fi-br-hexagon-check absolute text-green-500 text-3xl top-2 right-2"></i>
                )}
            </div>
            <div className="flex w-full flex-col justify-between p-2 sm:p-4">
                <div className="flex flex-row items-baseline justify-between ">
                    <div className="w-full overflow-hidden">
                        <strong
                            className="text-lg truncate">{`${searchInfo.brand} ${searchInfo.model} ${searchInfo.year}`}</strong>
                    </div>
                </div>
                <div className="flex md:grid md:grid-cols-[2fr_1fr] text-sm mt-2 md:justify-between">
                    <div className="w-8/12 lg:w-9/12 flex flex-col">
                        <div className="text-base">
                            <strong>
                                {"Total profit: " + "$" + displayMoneyWith2Digits(searchInfo.pricePerDay)}
                            </strong>
                        </div>

                        <div className="text-base">
                            <strong>
                                {"Available profit: " + "$" + displayMoneyWith2Digits(valueLeft)}
                            </strong>
                        </div>
                        <div className="text-base">
                            <strong>
                                {"My profit part: " + "$" + displayMoneyWith2Digits(valueLeft / 3)}
                            </strong>
                        </div>
                    </div>

                </div>

                <div className="w-full grid grid-cols-[1fr_auto] items-end mt-4">
                    <RntButton
                        className="h-14 w-44 text-base"
                        onClick={() => {
                            setValue(0)
                        }}
                        disabled={disableButton}
                    >
                        <div>{"Claim"}</div>
                        <div>
                            {valueLeft / 3}
                        </div>
                    </RntButton>
                </div>
            </div>
        </div>
    );
}
