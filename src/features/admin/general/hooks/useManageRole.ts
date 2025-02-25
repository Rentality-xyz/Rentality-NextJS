import { Role } from "@/model/blockchain/schemas";
import { useRentalityAdmin } from "@/contexts/rentalityContext";
import { useState } from "react";

const useManageRole = () => {
  const { admin } = useRentalityAdmin();
  const [isPending, setIsPending] = useState(false);

  async function manageRole(address: string, action: "grand" | "revoke", role: Role) {
    if (!admin) {
      console.error("manageRole error: rentalityAdminGateway is null");
      return false;
    }

    setIsPending(true);

    const result = await admin.manageRole(role, address, action === "grand");

    setIsPending(false);
    return result.ok;
  }

  return { isPending, manageRole } as const;
};

export default useManageRole;
