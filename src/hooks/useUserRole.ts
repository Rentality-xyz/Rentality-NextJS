import { useRentality } from "@/contexts/rentalityContext";
import { useEffect, useState } from "react";

export type ROLE = "Guest" | "Host";

const useUserRole = () => {
  const { rentalityContracts } = useRentality();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<ROLE>("Guest");

  useEffect(() => {
    const getUserRole = async () => {
      if (!rentalityContracts) return;

      const result = await rentalityContracts.gatewayProxy.getMyCars();

      if (result.ok) {
        setUserRole(result.value.length > 0 ? "Host" : "Guest");
      }
      setIsLoading(false);
    };
    getUserRole();
  }, [rentalityContracts]);

  return { isLoading, userRole } as const;
};

export default useUserRole;
