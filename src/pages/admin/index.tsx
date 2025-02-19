import RntInput from "@/components/common/rntInput";
import RntInputWithButton from "@/components/common/rntInputWithButton";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import useAdminPanelInfo from "@/hooks/admin/useAdminPanelInfo";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/utils/i18n";
import { isEmpty } from "@/utils/string";
import { env } from "@/utils/env";
import ManageRole from "@/features/admin/general/components/ManageRole";

function Admin() {
  const {
    isLoading,
    adminContractInfo,
    withdrawFromPlatform,
    setPlatformFeeInPPM,
    saveKycCommission,
    saveClaimWaitingTime,
    updateKycInfoForAddress,
    setTestKycInfoForAddress,
    createTestTrip,
  } = useAdminPanelInfo();
  const [ethToWithdraw, setEthToWithdraw] = useState("0");
  const [newPlatformFee, setNewPlatformFee] = useState("");
  const [newKycCommission, setNewKycCommission] = useState("");
  const [newClaimWaitingTime, setNewClaimWaitingTime] = useState("");
  const [addressToUpdateKyc, setAddressToUpdateKyc] = useState("0x");
  const [addressToSetTestKycInfo, setAddressToSetTestKycInfo] = useState("0x");

  const [testCarId, setTestCarId] = useState("");
  const { showError } = useRntSnackbars();
  const { t } = useTranslation();
  const t_admin: TFunction = (name, options) => {
    return t("admin." + name, options);
  };
  const t_errors: TFunction = (name, options) => {
    return t_admin("errors." + name, options);
  };

  useEffect(() => {
    if (!adminContractInfo) return;
    setNewPlatformFee(adminContractInfo.platformFee.toString());
    setNewKycCommission(adminContractInfo.kycCommission.toString());
    setNewClaimWaitingTime(adminContractInfo.claimWaitingTime.toString());
  }, [adminContractInfo]);

  if (adminContractInfo == null) {
    return (
      <>
        <div className="flex flex-row items-center justify-between">
          <div className="text-2xl">
            <strong>{t_admin("contract_info")}</strong>
          </div>
        </div>
        <div className="mt-4">
          <label>{t_admin("contract_null")}</label>
        </div>
      </>
    );
  }

  const handleWithdraw = async () => {
    if (isEmpty(ethToWithdraw)) return;

    const value = Number.parseFloat(ethToWithdraw);
    if (value < 0) {
      showError(t_errors("less_than_zero"));
      return;
    }
    if (value > adminContractInfo.paymentBalance) {
      showError(t_errors("greater_than_contract_balance"));
      return;
    }

    try {
      await withdrawFromPlatform(value);
      setEthToWithdraw("0");
    } catch (e) {
      showError(t_errors("withdraw"));
    }
  };

  const handleSavePlatformCommission = async () => {
    if (isEmpty(newPlatformFee)) return;

    const value = Number.parseFloat(newPlatformFee);
    if (value < 0.0001 || value > 100) {
      showError(t_errors("commission_value_range"));
      return;
    }

    try {
      await setPlatformFeeInPPM(value);
    } catch (e) {
      showError(t_errors("platform_commission_error") + e);
    }
  };

  const handleSaveKycCommission = async () => {
    if (isEmpty(newKycCommission)) return;

    const value = Number.parseFloat(newKycCommission);
    if (value < 0) {
      showError(t_errors("kyc_commission_value_range"));
      return;
    }
    try {
      await saveKycCommission(value);
    } catch (e) {
      showError(t_errors("kyc_commission_error") + e);
    }
  };

  const handleSaveClaimWaitingTime = async () => {
    if (isEmpty(newClaimWaitingTime)) return;

    const value = Number.parseFloat(newClaimWaitingTime);
    if (value < 0) {
      showError(t_errors("claim_waiting_time_value_range"));
      return;
    }
    try {
      await saveClaimWaitingTime(value);
    } catch (e) {
      showError(t_errors("claim_waiting_time_error") + e);
    }
  };

  async function handleUpdateKycInfo() {
    if (isEmpty(addressToUpdateKyc) || !addressToUpdateKyc.startsWith("0x") || addressToUpdateKyc.length !== 42) return;

    try {
      await updateKycInfoForAddress(addressToUpdateKyc);
    } catch (e) {
      showError(t_errors("update_kyc_error") + e);
    }
  }

  async function handleSetTestKycInfo() {
    if (
      isEmpty(addressToSetTestKycInfo) ||
      !addressToSetTestKycInfo.startsWith("0x") ||
      addressToSetTestKycInfo.length !== 42
    )
      return;

    try {
      await setTestKycInfoForAddress(addressToSetTestKycInfo);
    } catch (e) {
      showError(t_errors("set_test_kyc_info_error") + e);
    }
  }

  async function handleCreateTestTrip() {
    if (isEmpty(testCarId)) return;

    try {
      await createTestTrip(testCarId);
    } catch (e) {
      showError("handleCreateTestTrip error: " + e);
    }
  }

  return (
    <>
      <PageTitle title="Contract info" />
      <div className="grid grid-cols-2 gap-4 text-lg">
        <RntInput
          id="balance"
          label="Platform contract balance:"
          value={adminContractInfo.platformBalance + " ETH"}
          readOnly={true}
        />
        <RntInput
          id="balance1"
          label="Payment contract balance:"
          value={adminContractInfo.paymentBalance + " ETH"}
          readOnly={true}
        />
        <RntInput
          className="col-span-2"
          id="owner"
          label={t_admin("owner_addr")}
          value={adminContractInfo.ownerAddress}
          readOnly={true}
        />
      </div>

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
          handleWithdraw();
        }}
      />
      <RntInputWithButton
        id="platform_commission"
        placeholder="10%"
        label="Set new platform commission (%):"
        value={newPlatformFee}
        onChange={(e) => {
          setNewPlatformFee(e.target.value);
        }}
        buttonText={t("common.save")}
        buttonDisabled={!Number.parseFloat(newPlatformFee)}
        onButtonClick={() => {
          handleSavePlatformCommission();
        }}
      />
      <RntInputWithButton
        id="kyc_commission"
        placeholder="3"
        label="Price pass driver license verification, $:"
        value={newKycCommission}
        onChange={(e) => {
          setNewKycCommission(e.target.value);
        }}
        buttonText={t("common.save")}
        buttonDisabled={!Number.parseFloat(newKycCommission)}
        onButtonClick={() => {
          handleSaveKycCommission();
        }}
      />
      <RntInputWithButton
        id="claim_waiting_time"
        placeholder="3"
        label="Claim waiting time, sec:"
        value={newClaimWaitingTime}
        onChange={(e) => {
          setNewClaimWaitingTime(e.target.value);
        }}
        buttonText={t("common.save")}
        buttonDisabled={!Number.parseFloat(newClaimWaitingTime)}
        onButtonClick={() => {
          handleSaveClaimWaitingTime();
        }}
      />
      <ManageRole />
      <RntInputWithButton
        id="update_kyc_for_address"
        placeholder="0x"
        label="Update KYC info for address (only KYC manager)"
        value={addressToUpdateKyc}
        onChange={(e) => {
          setAddressToUpdateKyc(e.target.value);
        }}
        buttonText={"Update"}
        buttonDisabled={
          isEmpty(addressToUpdateKyc) || !addressToUpdateKyc.startsWith("0x") || addressToUpdateKyc.length !== 42
        }
        onButtonClick={() => {
          handleUpdateKycInfo();
        }}
      />
      {env.NEXT_PUBLIC_INCLUDE_TESTNETS === "true" && (
        <RntInputWithButton
          id="set_test_kyc_info_for_address"
          placeholder="0x"
          label="Set test KYC info for address (only KYC manager)"
          value={addressToSetTestKycInfo}
          onChange={(e) => {
            setAddressToSetTestKycInfo(e.target.value);
          }}
          buttonText={"Set"}
          buttonDisabled={
            isEmpty(addressToSetTestKycInfo) ||
            !addressToSetTestKycInfo.startsWith("0x") ||
            addressToSetTestKycInfo.length !== 42
          }
          onButtonClick={() => {
            handleSetTestKycInfo();
          }}
        />
      )}
      {env.NEXT_PUBLIC_INCLUDE_TESTNETS === "true" && (
        <RntInputWithButton
          id="create_test_trip_request"
          placeholder="car id"
          label="Create 3 days trip request for car (with -1% price) "
          value={testCarId}
          onChange={(e) => {
            setTestCarId(e.target.value);
          }}
          buttonText={"Create"}
          buttonDisabled={isEmpty(testCarId)}
          onButtonClick={() => {
            handleCreateTestTrip();
          }}
        />
      )}
    </>
  );
}

export default Admin;
