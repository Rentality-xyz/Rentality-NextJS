import { useTranslation } from "react-i18next";
import BaseBurgerNavMenu from "./baseBurgerNavMenu";
import BaseSideNavMenu from "./baseSideNavMenu";
import SideNavMenuGroup from "./sideNavMenuGroup";
import { useState } from "react";
import SideNavMenuItem from "@/components/sideNavMenu/sideNavMenuItem";
import MenuIcons from "@/components/sideNavMenu/menuIcons";
import * as React from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/auth/authContext";
import { TFunction } from "@/utils/i18n";

function AdminNavMenu() {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuth();

  const t_nav: TFunction = (name, options) => {
    return t("nav_menu." + name, options);
  };

  const router = useRouter();
  const selectedMenuHref = router.pathname;

  return (
    <>
      <SideNavMenuGroup title={"ADMIN"}>
        <SideNavMenuItem
          text={t("nav_menu.contract_info")}
          href="/admin"
          icon={MenuIcons.ContractInfo}
          matchPrefix={false}
          selectedMenuHref={selectedMenuHref}
        />
        <SideNavMenuItem
          text={t("nav_menu.car_locations")}
          href="/admin/carLocations"
          icon={MenuIcons.CarLocation}
          selectedMenuHref={selectedMenuHref}
        />
        <SideNavMenuItem
          text={t("nav_menu.all_trips_table")}
          href="/admin/allTrips"
          icon={MenuIcons.AllTripsTable}
          selectedMenuHref={selectedMenuHref}
        />
        <SideNavMenuItem
          text={t("nav_menu.all_users_table")}
          href="/admin/allUsers"
          icon={MenuIcons.AllUsersTable}
          selectedMenuHref={selectedMenuHref}
        />
          <SideNavMenuItem
          text={t("nav_menu.claim_types")}
          href="/admin/claimTypes"
          icon={MenuIcons.Claims}
          selectedMenuHref={selectedMenuHref}
        />
      </SideNavMenuGroup>

      {isAuthenticated ? (
        <>
          <div className="relative mb-6 mt-6 h-[2px] w-full">
            <div className="absolute right-[-48px] top-0 h-[2px] w-[97%] bg-[#40404F] sm:w-[98%] lg:w-[96%]" />
          </div>
          <SideNavMenuItem
            text={t_nav("logout")}
            href="/"
            onClick={logout}
            icon={MenuIcons.Logout}
            selectedMenuHref={selectedMenuHref}
          />
        </>
      ) : null}
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
