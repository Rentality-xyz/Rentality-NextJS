import { AdminAllTripsFilters } from "@/hooks/admin/useAdminAllTrips";
import React, { useState } from "react";

interface AllTripsFiltersProps {
  onApply: (filters: AdminAllTripsFilters) => Promise<void>;
}

function AllTripsFilters({}: AllTripsFiltersProps) {
  const [filters, setFilters] = useState<AdminAllTripsFilters>({});
  return <div className="mt-5 rounded-2xl bg-rentality-bg p-4">AllTripsFilters</div>;
}

AllTripsFilters.propTypes = {};

export default AllTripsFilters;
