import { useState } from "react";
import CivicConditions from "./civicConditions";
import CivicIssueReasons from "./civicIssueReasons";
import CustomCivicForm from "./customCivicForm";
import useCustomCivic from "@/hooks/kyc/useCustomCivic";
import { CivicProvider } from "@/contexts/web3/civicContext";

function CustomCivicDialogContent({
  showError,
  handleCancelClick,
}: {
  showError: (message: string) => void;
  handleCancelClick: () => void;
}) {
  const [isShowConditions, setIsShowConditions] = useState(false);
  const [isShowIssueReasons, setIsShowIssueReasons] = useState(false);
  const { status, commissionFee, payCommission, passKyc } = useCustomCivic();

  async function handlePayCommission() {
    const payCommissionResult = await payCommission();
    if (!payCommissionResult.ok) {
      showError(payCommissionResult.error);
    }
  }

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
      payCommission={handlePayCommission}
      passKyc={passKyc}
      handleCancelClick={handleCancelClick}
      openConditions={() => setIsShowConditions(true)}
      openIssueReasons={() => setIsShowIssueReasons(true)}
    />
  );
}

function CustomCivicDialog({
  showError,
  handleCancelClick,
}: {
  showError: (message: string) => void;
  handleCancelClick: () => void;
}) {
  return (
    <CivicProvider>
      <CustomCivicDialogContent showError={showError} handleCancelClick={handleCancelClick} />
    </CivicProvider>
  );
}

export default CustomCivicDialog;
