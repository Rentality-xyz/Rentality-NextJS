import AdminLayout from "@/components/admin/layout/adminLayout";
import InputBlock from "@/components/inputBlock";
import InputBlockWithButton from "@/components/inputBlock/inputBlockWithButton";
import useContractInfo from "@/hooks/admin/useContractInfo";
import { parseEther } from "ethers";
import { useState } from "react";

export default function Admin() {
  const [
    adminContractInfo,
    withdrawFromPlatform,
    setPlatformFeeInPPM,
    setDepositePriceInUsdCents,
    setFuelPricePerGalInUsdCents,
    updateUserService,
    updateCarService,
    updateTripService,
    updateCurrencyConverterService,
  ] = useContractInfo();
  const [ethToWithdraw, setEthToWithdraw] = useState("0");
  const [newPlatformCommission, setNewPlatformCommission] = useState("0");
  const [newPlatformDeposite, setNewPlatformDeposite] = useState("0");
  const [newPlatformFuelPrice, setNewPlatformFuelPrice] = useState("0");
  const [newUserServiceAddress, setNewUserServiceAddress] = useState("0x");
  const [newCarServiceAddress, setNewCarServiceAddress] = useState("0x");
  const [newTripsServiceAddress, setNewTripsServiceAddress] = useState("0x");
  const [
    newCurrencyConverterServiceAddress,
    setNewCurrencyConverterServiceAddress,
  ] = useState("0x");

  if (adminContractInfo == null) {
    return (
      <AdminLayout>
        <div className="flex flex-col px-8 pt-4">
          <div className="flex flex-row justify-between items-center">
            <div className="text-2xl">
              <strong>Contract info</strong>
            </div>
          </div>
          <div className="mt-4">
            <label>Contract is null: </label>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const withdraw = async () => {
    if (ethToWithdraw == null) return;
    const value = Number.parseFloat(ethToWithdraw);
    if (value < 0) {
      alert("value should be more then 0");
      return;
    }
    if (value > adminContractInfo.contractBalance) {
      alert("value should be less then contract balance");
      return;
    }
    try {
      
      const valueToWithdrawInWei = parseEther(ethToWithdraw);
      console.log("ethToWithdraw", ethToWithdraw);
      console.log("valueToWithdrawInWei", valueToWithdrawInWei);
      await withdrawFromPlatform(BigInt(valueToWithdrawInWei));
    } catch (e) {
      alert("withdraw error:" + e);
    }
  };

  const setPlatformCommission = async () => {
    if (newPlatformCommission == null) return;
    const value = Number.parseFloat(newPlatformCommission);
    if (value < 0.0001 || value > 100) {
      alert("value should be more then 0% and less than 100% (min value is 0.0001%)");
      return;
    }
    try {
      await setPlatformFeeInPPM(BigInt(Math.round(value*10_000)));
    } catch (e) {
      alert("setPlatformCommission error:" + e);
    }
  };

  const setPlatformDeposite = async () => {
    if (newPlatformDeposite == null) return;
    const value = Number.parseFloat(newPlatformDeposite);
    
    try {
      await setDepositePriceInUsdCents(BigInt(Math.round(value*100)));
    } catch (e) {
      alert("setPlatformDeposite error:" + e);
    }
  };

  const setPlatformFuelPrice = async () => {
    if (newPlatformFuelPrice == null) return;
    const value = Number.parseFloat(newPlatformFuelPrice);
    
    try {
      await setFuelPricePerGalInUsdCents(BigInt(Math.round(value*100)));
    } catch (e) {
      alert("setPlatformFuelPrice error:" + e);
    }
  };

  const setUserService = async () => {
    if (newUserServiceAddress == null) return;
    if (newUserServiceAddress.length != 42 || !newUserServiceAddress.startsWith("0x")) {
      alert("Address should start with 0x and contain 40 symbols");
      return;
    }
    try {
      await updateUserService(newUserServiceAddress);
    } catch (e) {
      alert("setUserService error:" + e);
    }
  };

  const setCarService = async () => {
    if (newCarServiceAddress == null) return;
    if (newCarServiceAddress.length != 42 || !newCarServiceAddress.startsWith("0x")) {
      alert("Address should start with 0x and contain 40 symbols");
      return;
    }
    try {
      await updateCarService(newCarServiceAddress);
    } catch (e) {
      alert("setCarService error:" + e);
    }
  };

  const setTripsService = async () => {
    if (newTripsServiceAddress == null) return;
    if (newTripsServiceAddress.length != 42 || !newTripsServiceAddress.startsWith("0x")) {
      alert("Address should start with 0x and contain 40 symbols");
      return;
    }
    try {
      await updateTripService(newTripsServiceAddress);
    } catch (e) {
      alert("setTripsService error:" + e);
    }
  };

  const setCurrencyConverterService = async () => {
    if (newCurrencyConverterServiceAddress == null) return;
    if (newCurrencyConverterServiceAddress.length != 42 || !newCurrencyConverterServiceAddress.startsWith("0x")) {
      alert("Address should start with 0x and contain 40 symbols");
      return;
    }
    try {
      await updateCurrencyConverterService(newCurrencyConverterServiceAddress);
    } catch (e) {
      alert("setCurrencyConverterService error:" + e);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col px-8 py-4">
        <div className="flex flex-row justify-between items-center">
          <div className="text-2xl">
            <strong>Contract info</strong>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <InputBlock
            id="balance"
            label="Rentality contract balance:"
            value={adminContractInfo.contractBalanceString + " ETH"}
            readOnly={true}
          />
          <InputBlockWithButton
            id="withdraw"
            placeholder="0.00 ETH"
            label="Withdraw from Rentality contract balance:"
            value={ethToWithdraw}
            onValueChange={(e) => {
              setEthToWithdraw(e.target.value);
            }}
            buttonText="Withdraw"
            buttonDisabled={!Number.parseFloat(ethToWithdraw)}
            onButtonClick={() => {
              withdraw();
            }}
          />
          <InputBlock
            id="contract"
            label="Rentality contract address:"
            value={adminContractInfo.contractAddress}
            readOnly={true}
          />
          <InputBlock
            id="owner"
            label="Contract owner address:"
            value={adminContractInfo.contractOwnerAddress}
            readOnly={true}
          />
          <InputBlock
            id="commission"
            label="Rentality platform commission:"
            value={adminContractInfo.rentalityCommission.toString() + "%"}
            readOnly={true}
          />
          <InputBlockWithButton
            id="commissionSet"
            placeholder="10%"
            label="Set new platform commission (%):"
            value={newPlatformCommission}
            onValueChange={(e) => {
              setNewPlatformCommission(e.target.value);
            }}
            buttonText="Save"
            buttonDisabled={!Number.parseFloat(newPlatformCommission)}
            onButtonClick={() => {
              setPlatformCommission();
            }}
          />
          <InputBlock
            id="deposite"
            label="Default platform deposite in USD:"
            value={"$" + adminContractInfo.rentalityDeposite.toString()}
            readOnly={true}
          />
          <InputBlockWithButton
            id="depositeSet"
            placeholder="$100"
            label="Set new default deposite (USD):"
            value={newPlatformDeposite}
            onValueChange={(e) => {
              setNewPlatformDeposite(e.target.value);
            }}
            buttonText="Save"
            buttonDisabled={!Number.parseFloat(newPlatformDeposite)}
            onButtonClick={() => {
              setPlatformDeposite();
            }}
          />
          <InputBlock
            id="fuelPrice"
            label="Default platform fuel price in USD:"
            value={"$" + adminContractInfo.rentalityFuelPricePerGal.toString()}
            readOnly={true}
          />
          <InputBlockWithButton
            id="fuelPriceSet"
            placeholder="4.50"
            label="Set new default fuel price (USD):"
            value={newPlatformFuelPrice}
            onValueChange={(e) => {
              setNewPlatformFuelPrice(e.target.value);
            }}
            buttonText="Save"
            buttonDisabled={!Number.parseFloat(newPlatformFuelPrice)}
            onButtonClick={() => {
              setPlatformFuelPrice();
            }}
          />
          <InputBlock
            id="userService"
            label="User service contract address:"
            value={adminContractInfo.userServiceContractAddress}
            readOnly={true}
          />
          <InputBlockWithButton
            id="userServiceSet"
            placeholder="0x"
            label="Set user service contract address:"
            value={newUserServiceAddress}
            onValueChange={(e) => {
              setNewUserServiceAddress(e.target.value);
            }}
            buttonText="Save"
            buttonDisabled={newUserServiceAddress.length != 42}
            onButtonClick={() => {
              setUserService();
            }}
          />
          <InputBlock
            id="carService"
            label="Car new service contract address:"
            value={adminContractInfo.carServiceContractAddress}
            readOnly={true}
          />
          <InputBlockWithButton
            id="carServiceSet"
            placeholder="0x"
            label="Set new car service contract address:"
            value={newCarServiceAddress}
            onValueChange={(e) => {
              setNewCarServiceAddress(e.target.value);
            }}
            buttonText="Save"
            buttonDisabled={newCarServiceAddress.length != 42}
            onButtonClick={() => {
              setCarService();
            }}
          />
          <InputBlock
            id="tripService"
            label="Trips service contract address:"
            value={adminContractInfo.tripServiceContractAddress}
            readOnly={true}
          />
          <InputBlockWithButton
            id="tripServiceSet"
            placeholder="0x"
            label="Set new trips service contract address:"
            value={newTripsServiceAddress}
            onValueChange={(e) => {
              setNewTripsServiceAddress(e.target.value);
            }}
            buttonText="Save"
            buttonDisabled={newTripsServiceAddress.length != 42}
            onButtonClick={() => {
              setTripsService();
            }}
          />
          <InputBlock
            id="currencyConverter"
            label="Currency converter contract address:"
            value={adminContractInfo.currencyConverterContractAddress}
            readOnly={true}
          />
          <InputBlockWithButton
            id="currencyConverterSet"
            placeholder="0x"
            label="Set new currency converter contract address:"
            value={newCurrencyConverterServiceAddress}
            onValueChange={(e) => {
              setNewCurrencyConverterServiceAddress(e.target.value);
            }}
            buttonText="Save"
            buttonDisabled={newCurrencyConverterServiceAddress.length != 42}
            onButtonClick={() => {
              setCurrencyConverterService();
            }}
          />
        </div>
        {/* <div className="mt-4">
          <label className="text-xl">Rentality contract address: </label>
          <div className="font-bold">{adminContractInfo.contractAddress}</div>
        </div> */}
      </div>
    </AdminLayout>
  );
}
