export type ROLE = "Guest" | "Host";

const useUserRole = () => {
  const userRole: ROLE = "Host";

  return { userRole } as const;
};

export default useUserRole;
