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

      try {
        const myCars = await rentalityContracts.gateway.getMyCars();
        setUserRole(myCars.length > 0 ? "Host" : "Guest");
      } catch (e) {
        console.error("getUserRole error:" + e);
      } finally {
        setIsLoading(false);
      }
    };
    getUserRole();
  }, [rentalityContracts]);

  return { isLoading, userRole } as const;
};

export default useUserRole;
