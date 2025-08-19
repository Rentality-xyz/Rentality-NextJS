import { ClaimType, ClaimUsers } from "@/features/admin/claimTypes/models/claims";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/utils/i18n";
import RntSuspense from "@/components/common/rntSuspense";
import Loading from "@/components/common/Loading";
import { HostInsuranceClaim } from "@/features/admin/hostClaims/models/hostInsuranceClaim";

interface HostClaimsTableProps {
  isLoading: boolean;
  data: HostInsuranceClaim[];
  onPay: (claimId: number) => void;
}

function HostClaimsTable({ isLoading, data, onPay }: HostClaimsTableProps) {
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
            <tr key={claim.claimId} className="border-b-[2px] border-b-gray-500">
              <td className={rowSpanClassName}>{claim.host}</td>
              <td className={rowSpanClassName}>{claim.guest}</td>
              <td className={rowSpanClassName}>
                <button
                  onClick={() => onPay(claim.claimId)}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  {t_att("pay")}
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

export default HostClaimsTable;