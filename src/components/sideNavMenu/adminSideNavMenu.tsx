import { useTranslation } from "react-i18next";
import BaseBurgerNavMenu from "./baseBurgerNavMenu";
import BaseSideNavMenu from "./baseSideNavMenu";
import SideNavMenuGroup from "./sideNavMenuGroup";

function AdminNavMenu() {
  const { t } = useTranslation();

  return (
    <>
      <SideNavMenuGroup title={t("nav_menu.contract_info")} href="/admin" />
      <SideNavMenuGroup title={t("nav_menu.car_locations")} href="/admin/carLocations" />
      <SideNavMenuGroup title={t("nav_menu.all_trips_table")} href="/admin/allTrips" />
      <SideNavMenuGroup title={t("nav_menu.all_users_table")} href="/admin/allUsers" />
      <SideNavMenuGroup title={t("nav_menu.claim_types")} href="/admin/claimTypes" />
    </>
  );
}

export default function AdminSideNavMenu() {
  return (
    <BaseSideNavMenu>
      <AdminNavMenu />
    </BaseSideNavMenu>
  );
}

export function AdminBurgerNavMenu() {
  return (
    <BaseBurgerNavMenu>
      <AdminNavMenu />
    </BaseBurgerNavMenu>
  );
}
