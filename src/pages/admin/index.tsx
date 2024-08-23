import RntInput from "@/components/common/rntInput";
import RntInputWithButton from "@/components/common/rntInputWithButton";
import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import useAdminPanelInfo from "@/hooks/admin/useAdminPanelInfo";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/utils/i18n";
import { isEmpty } from "@/utils/string";

export default function Admin() {
  const {
    isLoading,
    adminContractInfo,
    withdrawFromPlatform,
    setPlatformFeeInPPM,
    saveKycCommission,
    saveClaimWaitingTime,
    grantAdminRole,
  } = useAdminPanelInfo();
  const [ethToWithdraw, setEthToWithdraw] = useState("0");
  const [newPlatformFee, setNewPlatformFee] = useState("");
  const [newKycCommission, setNewKycCommission] = useState("");
  const [newClaimWaitingTime, setNewClaimWaitingTime] = useState("");
  const [addressForAdminRole, setAddressForAdminRole] = useState("0x");
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
      <Layout>
        <div className="flex flex-col">
          <div className="flex flex-row items-center justify-between">
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

  const handleWithdraw = async () => {
    if (isEmpty(ethToWithdraw)) return;

    const value = Number.parseFloat(ethToWithdraw);
    if (value < 0) {
      showError(t_errors("less_than_zero"));
      return;
    }
    if (value > adminContractInfo.platformBalance) {
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

  const handleGrantAdminRole = async () => {
    if (isEmpty(addressForAdminRole) || !addressForAdminRole.startsWith("0x") || addressForAdminRole.length !== 42)
      return;

    try {
      await grantAdminRole(addressForAdminRole);
    } catch (e) {
      showError(t_errors("grant_admin_role_error") + e);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-4">
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
        <RntInputWithButton
          id="grand_admin_role"
          placeholder="0x"
          label="Grant admin role to address"
          value={addressForAdminRole}
          onChange={(e) => {
            setAddressForAdminRole(e.target.value);
          }}
          buttonText={"Grant"}
          buttonDisabled={
            isEmpty(addressForAdminRole) || !addressForAdminRole.startsWith("0x") || addressForAdminRole.length !== 42
          }
          onButtonClick={() => {
            handleGrantAdminRole();
          }}
        />
      </div>
    </Layout>
  );
}
