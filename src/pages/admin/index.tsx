import RntInput from "@/components/common/rntInput";
import RntInputWithButton from "@/components/common/rntInputWithButton";
import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import useContractInfo from "@/hooks/admin/useContractInfo";
import { parseEther } from "ethers";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/utils/i18n";

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
  const { showError } = useRntDialogs();
  const { t } = useTranslation();
  const t_admin: TFunction = (name, options) => {
    return t("admin." + name, options);
  };
  const t_errors: TFunction = (name, options) => {
    return t_admin("errors." + name, options);
  };

  if (adminContractInfo == null) {
    return (
      <Layout>
        <div className="flex flex-col">
          <div className="flex flex-row justify-between items-center">
            <div className="text-2xl">
              <strong>{t_admin("contract_info")}</strong>
            </div>
          </div>
          <div className="mt-4">
            <label>{t_admin("contract_null")}</label>
          </div>
        </div>
      </Layout>
    );
  }

  const withdraw = async () => {
    if (ethToWithdraw == null) return;
    const value = Number.parseFloat(ethToWithdraw);
    if (value < 0) {
      showError(t_errors("less_than_zero"));
      return;
    }
    if (value > adminContractInfo.contractBalance) {
      showError(t_errors("greater_than_contract_balance"));
      return;
    }
    try {
      const valueToWithdrawInWei = parseEther(ethToWithdraw);
      await withdrawFromPlatform(BigInt(valueToWithdrawInWei));
      setEthToWithdraw("0");
    } catch (e) {
      showError(t_errors("withdraw"));
    }
  };

  const setPlatformCommission = async () => {
    if (newPlatformCommission == null) return;
    const value = Number.parseFloat(newPlatformCommission);
    if (value < 0.0001 || value > 100) {
      showError(t_errors("commission_value_range"));
      return;
    }
    try {
      await setPlatformFeeInPPM(BigInt(Math.round(value * 10_000)));
      setNewPlatformCommission("0");
    } catch (e) {
      showError(t_errors("platform_commission_error") + e);
    }
  };

  const setUserService = async () => {
    if (newUserServiceAddress == null) return;
    if (newUserServiceAddress.length != 42 || !newUserServiceAddress.startsWith("0x")) {
      showError(t_errors(" address_format"));
      return;
    }
    try {
      await updateUserService(newUserServiceAddress);
      setNewUserServiceAddress("0x");
    } catch (e) {
      showError(t_errors("set_user_service_error") + e);
    }
  };

  const setCarService = async () => {
    if (newCarServiceAddress == null) return;
    if (newCarServiceAddress.length != 42 || !newCarServiceAddress.startsWith("0x")) {
      showError(t_errors("address_format"));
      return;
    }
    try {
      await updateCarService(newCarServiceAddress);
      setNewCarServiceAddress("0x");
    } catch (e) {
      showError(t_errors("set_user_service"));
    }
  };

  const setTripsService = async () => {
    if (newTripsServiceAddress == null) return;
    if (newTripsServiceAddress.length != 42 || !newTripsServiceAddress.startsWith("0x")) {
      showError(t_errors("address_format"));
      return;
    }
    try {
      await updateTripService(newTripsServiceAddress);
      setNewTripsServiceAddress("0x");
    } catch (e) {
      showError(t_errors("set_trip_service"));
    }
  };

  const setCurrencyConverterService = async () => {
    if (newCurrencyConverterServiceAddress == null) return;
    if (newCurrencyConverterServiceAddress.length != 42 || !newCurrencyConverterServiceAddress.startsWith("0x")) {
      showError(t_errors("address_format"));
      return;
    }
    try {
      await updateCurrencyConverterService(newCurrencyConverterServiceAddress);
      setNewCurrencyConverterServiceAddress("0x");
    } catch (e) {
      showError(t_errors("set_currency_converter_service") + e);
    }
  };

  const setPlatformService = async () => {
    if (newPlatformServiceAddress == null) return;
    if (newPlatformServiceAddress.length != 42 || !newPlatformServiceAddress.startsWith("0x")) {
      showError(t_errors("address_format"));
      return;
    }
    try {
      await updatePlatformService(newPlatformServiceAddress);
      setNewPlatformServiceAddress("0x");
    } catch (e) {
      showError(t_errors("set_platform_service") + e);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title="Contract info" />
        <div className="grid grid-cols-2 gap-4 mt-4 text-lg">
          <RntInput
            id="balance"
            label={t_admin("balance")}
            value={adminContractInfo.contractBalanceString + " ETH"}
            readOnly={true}
          />
          <RntInputWithButton
            id="withdraw"
            placeholder="0.00 ETH"
            label={t_admin("withdraw")}
            value={ethToWithdraw}
            onChange={(e) => {
              setEthToWithdraw(e.target.value);
            }}
            buttonText={t_admin("withdraw_button")}
            buttonDisabled={!Number.parseFloat(ethToWithdraw)}
            onButtonClick={() => {
              withdraw();
            }}
          />
          <RntInput
            id="contract"
            label={t_admin("contract_addr")}
            value={adminContractInfo.contractAddress}
            readOnly={true}
          />
          <RntInput
            id="owner"
            label={t_admin("owner_addr")}
            value={adminContractInfo.contractOwnerAddress}
            readOnly={true}
          />
          <RntInput
            id="commission"
            label={t_admin("commission")}
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
            buttonText={t("common.save")}
            buttonDisabled={!Number.parseFloat(newPlatformCommission)}
            onButtonClick={() => {
              setPlatformCommission();
            }}
          />
          <RntInput
            id="userService"
            label={t_admin("user_s_addr")}
            value={adminContractInfo.userServiceContractAddress}
            readOnly={true}
          />
          <RntInputWithButton
            id="userServiceSet"
            placeholder="0x"
            label={t_admin("set_user_s")}
            value={newUserServiceAddress}
            onChange={(e) => {
              setNewUserServiceAddress(e.target.value);
            }}
            buttonText={t("common.save")}
            buttonDisabled={newUserServiceAddress.length != 42}
            onButtonClick={() => {
              setUserService();
            }}
          />
          <RntInput
            id="carService"
            label={t_admin("car_s_addr")}
            value={adminContractInfo.carServiceContractAddress}
            readOnly={true}
          />
          <RntInputWithButton
            id="carServiceSet"
            placeholder="0x"
            label={t_admin("set_car_s")}
            value={newCarServiceAddress}
            onChange={(e) => {
              setNewCarServiceAddress(e.target.value);
            }}
            buttonText={t("common.save")}
            buttonDisabled={newCarServiceAddress.length != 42}
            onButtonClick={() => {
              setCarService();
            }}
          />
          <RntInput
            id="tripService"
            label={t_admin("trip_s_addr")}
            value={adminContractInfo.tripServiceContractAddress}
            readOnly={true}
          />
          <RntInputWithButton
            id="tripServiceSet"
            placeholder="0x"
            label={t_admin("set_trip_s")}
            value={newTripsServiceAddress}
            onChange={(e) => {
              setNewTripsServiceAddress(e.target.value);
            }}
            buttonText={t("common.save")}
            buttonDisabled={newTripsServiceAddress.length != 42}
            onButtonClick={() => {
              setTripsService();
            }}
          />
          <RntInput
            label={t_admin("cur_converter_addr")}
            value={adminContractInfo.currencyConverterContractAddress}
            readOnly={true}
          />
          <RntInputWithButton
            id="currencyConverterSet"
            placeholder="0x"
            label={t_admin("set_cur_converter")}
            value={newCurrencyConverterServiceAddress}
            onChange={(e) => {
              setNewCurrencyConverterServiceAddress(e.target.value);
            }}
            buttonText={t("common.save")}
            buttonDisabled={newCurrencyConverterServiceAddress.length != 42}
            onButtonClick={() => {
              setCurrencyConverterService();
            }}
          />
          <RntInput
            id="platform"
            label={t_admin("platform_addr")}
            value={adminContractInfo.platformContractAddress}
            readOnly={true}
          />
          <RntInputWithButton
            id="platformSet"
            placeholder="0x"
            label={t_admin("set_platform_s")}
            value={newPlatformServiceAddress}
            onChange={(e) => {
              setNewPlatformServiceAddress(e.target.value);
            }}
            buttonText={t("common.save")}
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
    </Layout>
  );
}
