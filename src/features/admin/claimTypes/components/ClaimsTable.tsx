import Loading from "@/components/common/Loading";
import RntSuspense from "@/components/common/rntSuspense";
import { ClaimType, ClaimUsers } from "../models/claims";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/utils/i18n";

interface AllСlaimsTableProps {
    isLoading: boolean;
    data: ClaimType[];
    onDelete: (claimTypeId: number) => void;
  }
  
  function AllClaimsTable({ isLoading, data, onDelete }: AllСlaimsTableProps) {
    const { t } = useTranslation();
  
    const t_att: TFunction = (name, options) => {
      return t("admin_claim_types." + name, options);
    };
  
    const headerSpanClassName = "text-center font-semibold px-2 font-light text-sm";
    const rowSpanClassName = "px-2 h-12 text-center";
  
    const getClaimUserText = (userType: ClaimUsers) => {
      switch(userType) {
        case ClaimUsers.Host: return t_att("host");
        case ClaimUsers.Guest: return t_att("guest");
        case ClaimUsers.Both: return t_att("both");
        default: return "-";
      }
    };
  
    return (
      <RntSuspense
        isLoading={isLoading}
        fallback={
          <div className="rounded-b-2xl bg-rentality-bg p-4 pb-8">
            <Loading />
          </div>
        }
      >
        <div className="custom-scroll w-full overflow-x-auto">
          <table className="w-full table-auto border-spacing-2">
            <thead className="mb-2">
              <tr className="border-b-[2px] border-b-gray-500">
                <th className={`${headerSpanClassName} min-w-[10ch]`}>{t_att("claim_type_id")}</th>
                <th className={`${headerSpanClassName} min-w-[25ch]`}>{t_att("claim_name")}</th>
                <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("applicable_to")}</th>
                <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("delete")}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data.map((claim) => (
                <tr key={claim.claimTypeId} className="border-b-[2px] border-b-gray-500">
                  <td className={rowSpanClassName}>{claim.claimTypeId}</td>
                  <td className={rowSpanClassName}>{claim.claimTypeName}</td>
                  <td className={rowSpanClassName}>
                    {getClaimUserText(claim.claimUser)}
                  </td>
                  <td className={rowSpanClassName}>
                    <button 
                      onClick={() => onDelete(claim.claimTypeId)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      {t_att("delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </RntSuspense>
    );
  }
  
  export default AllClaimsTable;