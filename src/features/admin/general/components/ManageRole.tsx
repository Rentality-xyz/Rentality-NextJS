import React, { useState } from "react";
import RntButton from "@/components/common/rntButton";
import RntInput from "@/components/common/rntInput";
import RntSelect from "@/components/common/rntSelect";
import { Role } from "@/model/blockchain/schemas";
import { isEmpty } from "@/utils/string";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { useTranslation } from "react-i18next";
import useManageRole from "../hooks/useManageRole";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import RntFilterSelect from "@/components/common/RntFilterSelect";
import ScrollingHorizontally from "@/components/common/ScrollingHorizontally";

function ManageRole() {
  const { isPending, manageRole } = useManageRole();
  const [manageRoleState, setManageRoleState] = useState<{ address: string; action: "grand" | "revoke"; role: Role }>({
    address: "0x",
    action: "revoke",
    role: Role.Guest,
  });
  const { showError } = useRntSnackbars();
  const { t } = useTranslation();

  const handleManageRole = async () => {
    if (
      isEmpty(manageRoleState.address) ||
      !manageRoleState.address.startsWith("0x") ||
      manageRoleState.address.length !== 42 ||
      (manageRoleState.action !== "grand" && manageRoleState.action !== "revoke") ||
      manageRoleState.role < Role.Guest ||
      manageRoleState.role > Role.OracleManager
    )
      return;

    try {
      await manageRole(manageRoleState.address, manageRoleState.action, manageRoleState.role);
    } catch (error) {
      showError(t("admin.errors.grant_admin_role_error") + error);
    }
  };

  return (
    <div className="flex w-full flex-row gap-4 max-md:flex-col">
      <ScrollingHorizontally className="mt-8 w-full md:mt-2">
        <div className="flex w-full flex-none gap-4">
          <RntInputTransparent
            id="manageRoleAddress"
            className="min-w-[30ch] flex-1"
            placeholder="0x"
            label="Address"
            value={manageRoleState.address}
            maxLength={42}
            onChange={(e) => {
              setManageRoleState((prev) => ({ ...prev, address: e.target.value }));
            }}
          />
          <RntFilterSelect
            id="manageRoleAction"
            isTransparentStyle={true}
            className="w-40"
            label="Grant/Revoke"
            value={manageRoleState.action}
            onChange={(e) => {
              setManageRoleState((prev) => ({ ...prev, action: e.target.value as "grand" | "revoke" }));
            }}
          >
            <RntFilterSelect.Option value={"revoke"}>Revoke</RntFilterSelect.Option>
            <RntFilterSelect.Option value={"grand"}>Grand</RntFilterSelect.Option>
          </RntFilterSelect>
          <RntFilterSelect
            id="manageRole"
            isTransparentStyle={true}
            className="w-60"
            label="Role"
            value={manageRoleState.role.toString()}
            onChange={(e) => {
              setManageRoleState((prev) => ({ ...prev, role: BigInt(e.target.value) }));
            }}
          >
            <RntFilterSelect.Option value={Role.Guest.toString()}>Guest</RntFilterSelect.Option>
            <RntFilterSelect.Option value={Role.Host.toString()}>Host</RntFilterSelect.Option>
            <RntFilterSelect.Option value={Role.Manager.toString()}>Manager</RntFilterSelect.Option>
            <RntFilterSelect.Option value={Role.Admin.toString()}>Admin</RntFilterSelect.Option>
            <RntFilterSelect.Option value={Role.KYCManager.toString()}>KYC Manager</RntFilterSelect.Option>
            <RntFilterSelect.Option value={Role.AdminView.toString()}>Admin Viewer</RntFilterSelect.Option>
            <RntFilterSelect.Option value={Role.InvestmentManager.toString()}>
              Investment Manager
            </RntFilterSelect.Option>
            <RntFilterSelect.Option value={Role.OracleManager.toString()}>Oracle Manager</RntFilterSelect.Option>
          </RntFilterSelect>
        </div>
      </ScrollingHorizontally>
      <RntButton
        className="w-56 self-end max-md:w-full"
        disabled={
          isPending ||
          isEmpty(manageRoleState.address) ||
          !manageRoleState.address.startsWith("0x") ||
          manageRoleState.address.length !== 42 ||
          (manageRoleState.action !== "grand" && manageRoleState.action !== "revoke") ||
          manageRoleState.role < Role.Guest ||
          manageRoleState.role > Role.OracleManager
        }
        onClick={handleManageRole}
      >
        {manageRoleState.action === "grand" ? "Grand" : "Revoke"}
      </RntButton>
    </div>
  );
}

export default ManageRole;
