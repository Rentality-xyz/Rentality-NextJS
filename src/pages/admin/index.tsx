import AdminLayout from "@/components/admin/layout/adminLayout";
import RntDialogs from "@/components/common/rntDialogs";
import RntInput from "@/components/common/rntInput";
import RntInputWithButton from "@/components/common/rntInputWithButton";
import PageTitle from "@/components/pageTitle/pageTitle";
import useContractInfo from "@/hooks/admin/useContractInfo";
import useRntDialogs from "@/hooks/useRntDialogs";
import { parseEther } from "ethers";
import { useState } from "react";

export default function Admin() {
  const [
    adminContractInfo,
    withdrawFromPlatform,
    setPlatformFeeInPPM,
    updateUserService,
    updateCarService,
    updateTripService,
    updateCurrencyConverterService,
    updatePlatformService,
  ] = useContractInfo();
  const [ethToWithdraw, setEthToWithdraw] = useState("0");
  const [newPlatformCommission, setNewPlatformCommission] = useState("0");
  const [newUserServiceAddress, setNewUserServiceAddress] = useState("0x");
  const [newCarServiceAddress, setNewCarServiceAddress] = useState("0x");
  const [newTripsServiceAddress, setNewTripsServiceAddress] = useState("0x");
  const [newCurrencyConverterServiceAddress, setNewCurrencyConverterServiceAddress] = useState("0x");
  const [newPlatformServiceAddress, setNewPlatformServiceAddress] = useState("0x");
  const [dialogState, showInfo, showError, showMessager, hideSnackbar] = useRntDialogs();

  if (adminContractInfo == null) {
    return (
      <AdminLayout>
        <div className="flex flex-col">
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
      showError("value should be more then 0");
      return;
    }
    if (value > adminContractInfo.contractBalance) {
      showError("value should be less then contract balance");
      return;
    }
    try {
      const valueToWithdrawInWei = parseEther(ethToWithdraw);
      await withdrawFromPlatform(BigInt(valueToWithdrawInWei));
      setEthToWithdraw("0");
    } catch (e) {
      showError("withdraw error:" + e);
    }
  };

  const setPlatformCommission = async () => {
    if (newPlatformCommission == null) return;
    const value = Number.parseFloat(newPlatformCommission);
    if (value < 0.0001 || value > 100) {
      showError("value should be more then 0% and less than 100% (min value is 0.0001%)");
      return;
    }
    try {
      await setPlatformFeeInPPM(BigInt(Math.round(value * 10_000)));
      setNewPlatformCommission("0");
    } catch (e) {
      showError("setPlatformCommission error:" + e);
    }
  };

  const setUserService = async () => {
    if (newUserServiceAddress == null) return;
    if (newUserServiceAddress.length != 42 || !newUserServiceAddress.startsWith("0x")) {
      showError("Address should start with 0x and contain 40 symbols");
      return;
    }
    try {
      await updateUserService(newUserServiceAddress);
      setNewUserServiceAddress("0x");
    } catch (e) {
      showError("setUserService error:" + e);
    }
  };

  const setCarService = async () => {
    if (newCarServiceAddress == null) return;
    if (newCarServiceAddress.length != 42 || !newCarServiceAddress.startsWith("0x")) {
      showError("Address should start with 0x and contain 40 symbols");
      return;
    }
    try {
      await updateCarService(newCarServiceAddress);
      setNewCarServiceAddress("0x");
    } catch (e) {
      showError("setCarService error:" + e);
    }
  };

  const setTripsService = async () => {
    if (newTripsServiceAddress == null) return;
    if (newTripsServiceAddress.length != 42 || !newTripsServiceAddress.startsWith("0x")) {
      showError("Address should start with 0x and contain 40 symbols");
      return;
    }
    try {
      await updateTripService(newTripsServiceAddress);
      setNewTripsServiceAddress("0x");
    } catch (e) {
      showError("setTripsService error:" + e);
    }
  };

  const setCurrencyConverterService = async () => {
    if (newCurrencyConverterServiceAddress == null) return;
    if (newCurrencyConverterServiceAddress.length != 42 || !newCurrencyConverterServiceAddress.startsWith("0x")) {
      showError("Address should start with 0x and contain 40 symbols");
      return;
    }
    try {
      await updateCurrencyConverterService(newCurrencyConverterServiceAddress);
      setNewCurrencyConverterServiceAddress("0x");
    } catch (e) {
      showError("setCurrencyConverterService error:" + e);
    }
  };

  const setPlatformService = async () => {
    if (newPlatformServiceAddress == null) return;
    if (newPlatformServiceAddress.length != 42 || !newPlatformServiceAddress.startsWith("0x")) {
      showError("Address should start with 0x and contain 40 symbols");
      return;
    }
    try {
      await updatePlatformService(newPlatformServiceAddress);
      setNewPlatformServiceAddress("0x");
    } catch (e) {
      showError("setPlatformService error:" + e);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col">
        <PageTitle title="Contract info" />
        <div className="grid grid-cols-2 gap-4 mt-4 text-lg">
          <RntInput
            id="balance"
            label="Rentality contract balance:"
            value={adminContractInfo.contractBalanceString + " ETH"}
            readOnly={true}
          />
          <RntInputWithButton
            id="withdraw"
            placeholder="0.00 ETH"
            label="Withdraw from Rentality contract balance:"
            value={ethToWithdraw}
            onChange={(e) => {
              setEthToWithdraw(e.target.value);
            }}
            buttonText="Withdraw"
            buttonDisabled={!Number.parseFloat(ethToWithdraw)}
            onButtonClick={() => {
              withdraw();
            }}
          />
          <RntInput
            id="contract"
            label="Rentality contract address:"
            value={adminContractInfo.contractAddress}
            readOnly={true}
          />
          <RntInput
            id="owner"
            label="Contract owner address:"
            value={adminContractInfo.contractOwnerAddress}
            readOnly={true}
          />
          <RntInput
            id="commission"
            label="Rentality platform commission:"
            value={adminContractInfo.rentalityCommission.toString() + "%"}
            readOnly={true}
          />
          <RntInputWithButton
            id="commissionSet"
            placeholder="10%"
            label="Set new platform commission (%):"
            value={newPlatformCommission}
            onChange={(e) => {
              setNewPlatformCommission(e.target.value);
            }}
            buttonText="Save"
            buttonDisabled={!Number.parseFloat(newPlatformCommission)}
            onButtonClick={() => {
              setPlatformCommission();
            }}
          />
          <RntInput
            id="userService"
            label="User service contract address:"
            value={adminContractInfo.userServiceContractAddress}
            readOnly={true}
          />
          <RntInputWithButton
            id="userServiceSet"
            placeholder="0x"
            label="Set user service contract address:"
            value={newUserServiceAddress}
            onChange={(e) => {
              setNewUserServiceAddress(e.target.value);
            }}
            buttonText="Save"
            buttonDisabled={newUserServiceAddress.length != 42}
            onButtonClick={() => {
              setUserService();
            }}
          />
          <RntInput
            id="carService"
            label="Car service contract address:"
            value={adminContractInfo.carServiceContractAddress}
            readOnly={true}
          />
          <RntInputWithButton
            id="carServiceSet"
            placeholder="0x"
            label="Set car service contract address:"
            value={newCarServiceAddress}
            onChange={(e) => {
              setNewCarServiceAddress(e.target.value);
            }}
            buttonText="Save"
            buttonDisabled={newCarServiceAddress.length != 42}
            onButtonClick={() => {
              setCarService();
            }}
          />
          <RntInput
            id="tripService"
            label="Trips service contract address:"
            value={adminContractInfo.tripServiceContractAddress}
            readOnly={true}
          />
          <RntInputWithButton
            id="tripServiceSet"
            placeholder="0x"
            label="Set new trips service contract address:"
            value={newTripsServiceAddress}
            onChange={(e) => {
              setNewTripsServiceAddress(e.target.value);
            }}
            buttonText="Save"
            buttonDisabled={newTripsServiceAddress.length != 42}
            onButtonClick={() => {
              setTripsService();
            }}
          />
          <RntInput
            id="currencyConverter"
            label="Currency converter contract address:"
            value={adminContractInfo.currencyConverterContractAddress}
            readOnly={true}
          />
          <RntInputWithButton
            id="currencyConverterSet"
            placeholder="0x"
            label="Set new currency converter contract address:"
            value={newCurrencyConverterServiceAddress}
            onChange={(e) => {
              setNewCurrencyConverterServiceAddress(e.target.value);
            }}
            buttonText="Save"
            buttonDisabled={newCurrencyConverterServiceAddress.length != 42}
            onButtonClick={() => {
              setCurrencyConverterService();
            }}
          />
          <RntInput
            id="platform"
            label="Platform contract address:"
            value={adminContractInfo.platformContractAddress}
            readOnly={true}
          />
          <RntInputWithButton
            id="platformSet"
            placeholder="0x"
            label="Set platform contract address:"
            value={newPlatformServiceAddress}
            onChange={(e) => {
              setNewPlatformServiceAddress(e.target.value);
            }}
            buttonText="Save"
            buttonDisabled={newPlatformServiceAddress.length != 42}
            onButtonClick={() => {
              setPlatformService();
            }}
          />
        </div>
        {/* <div className="mt-4">
          <label className="text-xl">Rentality contract address: </label>
          <div className="font-bold">{adminContractInfo.contractAddress}</div>
        </div> */}
      </div>
      <RntDialogs state={dialogState} hide={hideSnackbar} />
    </AdminLayout>
  );
}
