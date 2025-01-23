import React from "react";
import { AdminAllUsersFilters } from "../hooks/useAdminAllUsers";

interface AllUsersFiltersProps {
  defaultFilters?: AdminAllUsersFilters;
  onApply: (filters: AdminAllUsersFilters) => Promise<void>;
}

function AllUsersFilters({ defaultFilters, onApply }: AllUsersFiltersProps) {
  return <></>;
  return <div>AllUsersFilters</div>;
}

export default AllUsersFilters;
