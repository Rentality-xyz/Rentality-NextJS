import React, { useState } from "react";
import RntButton from "@/components/common/rntButton";
import RntInput from "@/components/common/rntInput";
import RntSelect from "@/components/common/rntSelect";
import { Role } from "@/model/blockchain/schemas";
import { isEmpty } from "@/utils/string";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { useTranslation } from "react-i18next";
import useManageRole from "../hooks/useManageRole";

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
      manageRoleState.role > Role.InvestmentManager
    )
      return;

    try {
      await manageRole(manageRoleState.address, manageRoleState.action, manageRoleState.role);
    } catch (e) {
      showError(t("admin.errors.grant_admin_role_error") + e);
    }
  };

  return (
    <div className="flex w-full flex-wrap gap-4">
      <RntInput
        id="manageRoleAddress"
        className="flex-1"
        placeholder="0x"
        label="Address"
        value={manageRoleState.address}
        maxLength={42}
        onChange={(e) => {
          setManageRoleState((prev) => ({ ...prev, address: e.target.value }));
        }}
      />
      <RntSelect
        id="manageRoleAction"
        className="w-40"
        label="Grant/Revoke"
        value={manageRoleState.action}
        onChange={(e) => {
          setManageRoleState((prev) => ({ ...prev, action: e.target.value as "grand" | "revoke" }));
        }}
      >
        <option value={"revoke"}>Revoke</option>
        <option value={"grand"}>Grand</option>
      </RntSelect>
      <RntSelect
        id="manageRole"
        className="w-60"
        label="Role"
        value={manageRoleState.role.toString()}
        onChange={(e) => {
          setManageRoleState((prev) => ({ ...prev, role: BigInt(e.target.value) }));
        }}
      >
        <option value={Role.Guest.toString()} selected>
          Guest
        </option>
        <option value={Role.Host.toString()} selected>
          Host
        </option>
        <option value={Role.Manager.toString()} selected>
          Manager
        </option>
        <option value={Role.Admin.toString()} selected>
          Admin
        </option>
        <option value={Role.KYCManager.toString()} selected>
          KYC Manager
        </option>
        <option value={Role.AdminView.toString()} selected>
          Admin Viewer
        </option>
        <option value={Role.InvestmentManager.toString()} selected>
          Investment Manager
        </option>
      </RntSelect>
      <RntButton
        className="w-56 self-end"
        disabled={
          isPending ||
          isEmpty(manageRoleState.address) ||
          !manageRoleState.address.startsWith("0x") ||
          manageRoleState.address.length !== 42 ||
          (manageRoleState.action !== "grand" && manageRoleState.action !== "revoke") ||
          manageRoleState.role < Role.Guest ||
          manageRoleState.role > Role.InvestmentManager
        }
        onClick={handleManageRole}
      >
        {manageRoleState.action === "grand" ? "Grand" : "Revoke"}
      </RntButton>
    </div>
  );
}

export default ManageRole;
