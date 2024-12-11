import { useRentality } from "@/contexts/rentalityContext";
import { useEffect, useState } from "react";

export type ROLE = "Guest" | "Host";

const useUserRole = () => {
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<ROLE>("Guest");

  useEffect(() => {
    const getUserRole = async () => {
      if (!rentalityContract) return;

      try {
        const myCars = await rentalityContract.getMyCars();
        setUserRole(myCars.length > 0 ? "Host" : "Guest");
      } catch (e) {
        console.error("getUserRole error:" + e);
      } finally {
        setIsLoading(false);
      }
    };
    getUserRole();
  }, [rentalityContract]);

  return { isLoading, userRole } as const;
};

export default useUserRole;
