import { useState } from "react";
import Loading from "@/components/common/Loading";
import RntSuspense from "@/components/common/rntSuspense";
import { ClaimUsers } from "../models/claims";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/utils/i18n";
import RntButton from "@/components/common/rntButton";
import RntInput from "@/components/common/rntInput";
import { Result } from "@/model/utils/result";
import RntSelect from "@/components/common/rntSelect";

interface AddClaimFormProps {
  addClaimType: (claimName: string, forUsers: ClaimUsers) => Promise<void>;
  isLoading?: boolean;
}


function AddClaimForm({ addClaimType, isLoading = false }: AddClaimFormProps) {
  const { t } = useTranslation();
  const t_att: TFunction = (name, options) => t("admin_claim_types." + name, options);
  
  const [claimName, setClaimName] = useState("");
  const [claimUser, setClaimUser] = useState<ClaimUsers>(ClaimUsers.Host);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
     await addClaimType(claimName, claimUser);
      setClaimName("");
      setClaimUser(ClaimUsers.Host);

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
      <div className="rounded-b-2xl bg-rentality-bg p-4 pb-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm">{t_att("claim_name")}</label>
              <RntInput
                type="text"
                value={claimName}
                onChange={(e) => setClaimName(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm">{t_att("applicable_to")}</label>
              <RntSelect
                value={claimUser}
                onChange={(e) => setClaimUser(Number(e.target.value))}
                className="w-full"
              >
                <option value={ClaimUsers.Host}>{t_att("host")}</option>
                <option value={ClaimUsers.Guest}>{t_att("guest")}</option>
                <option value={ClaimUsers.Both}>{t_att("both")}</option>
              </RntSelect>
            </div>

            <RntButton
              type="submit"
              disabled={isLoading}
            >
              {t_att("create_claim_btn")}
            </RntButton>
          </div>

          {errorMessage && (
            <div className="text-red-500 text-sm">{errorMessage}</div>
          )}
        </form>
      </div>
    </RntSuspense>
  );
}

export default AddClaimForm;