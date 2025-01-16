import React from "react";
import Link from "next/link";
import Loading from "@/components/common/Loading";
import RntSuspense from "@/components/common/rntSuspense";
import { TFunction } from "@/utils/i18n";
import { useTranslation } from "react-i18next";
import { Avatar } from "@mui/material";
import { dateFormatLongMonthYearDateTime, dateFormatShortMonthDateYear } from "@/utils/datetimeFormatters";
import { AdminUserDetails } from "../models";
import { formatAddress } from "@/utils/addressFormatters";

interface AllUsersTableProps {
  isLoading: boolean;
  data: AdminUserDetails[];
}

function AllUsersTable({ isLoading, data }: AllUsersTableProps) {
  const { t } = useTranslation();

  const t_att: TFunction = (name, options) => {
    return t("admin_all_users." + name, options);
  };

  const headerSpanClassName = "text-center font-semibold px-2 font-light text-sm";
  const rowSpanClassName = "px-2 h-12 text-center";

  return (
    <RntSuspense
      isLoading={isLoading}
      fallback={
        <div className="rounded-b-2xl bg-rentality-bg p-4 pb-8">
          <Loading />
        </div>
      }
    >
      <div className="text-xl lg:hidden">{t("common.low_resolution")}</div>
      <table className="hidden w-full table-auto border-spacing-2 overflow-x-auto lg:block">
        <thead className="mb-2">
          <tr className="border-b-[2px] border-b-gray-500">
            <th className={`${headerSpanClassName} min-w-[7ch]`}>{t_att("avatar")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("wallet")}</th>
            <th className={`${headerSpanClassName} min-w-[17ch]`}>{t_att("profile-creation-date")}</th>
            <th className={`${headerSpanClassName} min-w-[10ch]`}>{t_att("nickname")}</th>
            <th className={`${headerSpanClassName} min-w-[8ch]`}>{t_att("issue-country")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("phone-number")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("name")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("e-mail")}</th>
            <th className={`${headerSpanClassName} min-w-[10ch]`}>{t_att("driving-license-number")}</th>
            <th className={`${headerSpanClassName} min-w-[10ch]`}>{t_att("driving-license-validity-period")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("cars-in-listing")}</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {data.map((userDetails, index) => {
            const listingLink = `/hosts/${userDetails.walletAddress}`;

            return (
              <tr key={userDetails.TCSignature} className="border-b-[2px] border-b-gray-500">
                <td className={rowSpanClassName}>
                  <Avatar
                    className="my-2"
                    src={userDetails.profilePhoto}
                    sx={{ width: "3rem", height: "3rem" }}
                  ></Avatar>
                </td>
                <td className={rowSpanClassName}>{formatAddress(userDetails.walletAddress, 5, 4)}</td>
                <td className={rowSpanClassName}>{dateFormatLongMonthYearDateTime(userDetails.createDate)}</td>
                <td className={rowSpanClassName}>{userDetails.name}</td>
                <td className={rowSpanClassName}>{userDetails.issueCountry}</td>
                <td className={rowSpanClassName}>{userDetails.mobilePhoneNumber}</td>
                <td className={rowSpanClassName}>{userDetails.surname}</td>
                <td className={rowSpanClassName}>{userDetails.email}</td>
                <td className={rowSpanClassName}>{userDetails.licenseNumber}</td>
                <td className={rowSpanClassName}>{dateFormatShortMonthDateYear(userDetails.expirationDate)}</td>
                <td className={rowSpanClassName}>
                  <Link href={listingLink}>
                    <span className="text-rentality-secondary">{t_att("see_listing")}</span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </RntSuspense>
  );
}

export default AllUsersTable;
