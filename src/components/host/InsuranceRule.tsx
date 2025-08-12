import RntButton from "@/components/common/rntButton";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useFetchAllInsuranceRules, { InsuranceRule } from "@/hooks/host/useFetchAllInsuranceRules";
import RntInsuranceRuleSelect from "@/components/common/RntInsuranceRuleSelect";
import useSaveInsuranceRule from "@/hooks/host/useSaveInsuranceRule";
import { HostInsuranceRule } from "@/hooks/host/useFetchHostInsuranceRule";

function InsuranceRules({ hostInsuranceRule }: { hostInsuranceRule: HostInsuranceRule }) {
  const { allInsuranceRules } = useFetchAllInsuranceRules();
  const { mutateAsync: saveHostInsuranceRule } = useSaveInsuranceRule();
  const [insuranceRule, setInsuranceRule] = useState(hostInsuranceRule);
  const { showInfo, showSuccess, hideSnackbars, showError } = useRntSnackbars();

  const { t } = useTranslation();

  const handleSaveHostInsuranceRule = async () => {
    showInfo(t("common.info.sign"));
    const result = await saveHostInsuranceRule(insuranceRule);
    hideSnackbars();
    if (result.ok) {
      showSuccess(t("common.info.success"));
    } else {
      if (result.error.message === "NOT_ENOUGH_FUNDS") {
        showError(t("common.add_fund_to_wallet"));
      } else {
        showError(t("profile.save_insurance_rule_err"));
      }
    }
  };
  return (
    <div className="my-4 flex flex-col gap-4">
      <div className="mb-4 pl-[16px] text-lg">
        <strong>{t("profile.save_insurance_rule")}</strong>
      </div>
      <div className="flex flex-col gap-4">
        <RntInsuranceRuleSelect
          id={"select_filter_make"}
          isTransparentStyle={true}
          className="min-w-[17ch] justify-center bg-transparent pl-0 text-lg text-rentality-secondary"
          promptText={insuranceRule.partToInsurance.toString()}
          value={`${insuranceRule?.partToInsurance ?? ""} %`}
          allInsuranceRules={allInsuranceRules}
          onRuleSelect={(partToInsurance, insuranceId) => {
            setInsuranceRule({ partToInsurance, insuranceId });
          }}
        />
        <RntButton onClick={handleSaveHostInsuranceRule}>{t("profile.save_insurance_rule_btn")}</RntButton>
      </div>
    </div>
  );
}

export default InsuranceRules;
