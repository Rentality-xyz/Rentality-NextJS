import React from "react";
import { AdminUserDetails } from "../hooks/useAdminAllUsers";

interface AllUsersTableProps {
  isLoading: boolean;
  data: AdminUserDetails[];
}

function AllUsersTable({ isLoading, data }: AllUsersTableProps) {
  return <div>AllUsersTable</div>;
}

export default AllUsersTable;
