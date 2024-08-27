import { useState } from "react";
import CivicConditions from "./civicConditions";
import CivicIssueReasons from "./civicIssueReasons";
import CustomCivicForm from "./customCivicForm";
import useCustomCivic from "@/hooks/kyc/useCustomCivic";

function CustomCivicDialog({ handleCancelClick }: { handleCancelClick: () => void }) {
  const [isShowConditions, setIsShowConditions] = useState(false);
  const [isShowIssueReasons, setIsShowIssueReasons] = useState(false);
  const { status, commissionFee, payCommission, passKyc } = useCustomCivic();

  if (isShowConditions)
    return (
      <CivicConditions
        commissionFee={commissionFee}
        handleCancelClick={() => {
          setIsShowConditions(false);
        }}
      />
    );

  if (isShowIssueReasons)
    return (
      <CivicIssueReasons
        handleCancelClick={() => {
          setIsShowIssueReasons(false);
        }}
      />
    );

  return (
    <CustomCivicForm
      commissionFee={commissionFee}
      status={status}
      payCommission={payCommission}
      passKyc={passKyc}
      handleCancelClick={handleCancelClick}
      openConditions={() => setIsShowConditions(true)}
      openIssueReasons={() => setIsShowIssueReasons(true)}
    />
  );
}

export default CustomCivicDialog;
