import { KycStatus } from "@/hooks/kyc/useCustomCivic";
import RntButton from "../common/rntButton";
import DotStatus from "../profileInfo/dotStatus";

function CustomCivicForm({
  status,
  commissionFee,
  payCommission,
  passKyc,
  openConditions,
  openIssueReasons,
  handleCancelClick,
}: {
  status: KycStatus;
  commissionFee: number;
  payCommission: () => Promise<void>;
  passKyc: () => Promise<void>;
  openConditions: () => void;
  openIssueReasons: () => void;
  handleCancelClick: () => void;
}) {
  if (status === "Loading")
    return (
      <section className="flex flex-col md:px-4">
        <p>Loading...</p>
      </section>
    );
  if (status === "Init error")
    return (
      <section className="flex flex-col md:px-4">
        <p>Initialization error. Please try again!</p>
        <RntButton className="mt-4 place-self-center" onClick={handleCancelClick}>
          Close
        </RntButton>
      </section>
    );

  return (
    <section className="flex flex-col md:px-4">
      <span className="bg-[#7355D7] bg-[#FFFF00]">{/* for tailwind initialization */}</span>
      <h1 className="place-self-center text-xl font-bold text-rentality-secondary">Get verification</h1>{" "}
      <section className="mt-4 flex flex-col">
        <h2 className="place-self-center text-xl font-bold text-rentality-secondary">Step 1</h2>
        <p className="mt-2 place-self-center">
          Read the{" "}
          <span className="cursor-pointer underline" onClick={openConditions}>
            conditions
          </span>{" "}
          and pay for verification procedures
        </p>
        <RntButton
          className="mt-2 h-16 w-full px-2 sm:h-12 sm:px-0"
          disabled={!(status === "Not paid" || status === "Kyc failed")}
          onClick={payCommission}
        >
          I agree to conditions and pay ${commissionFee} for verified
        </RntButton>
        <div className="mt-2">
          {status === "Not paid" && (
            <DotStatus
              containerClassName="text-sm"
              color="#FFFF00"
              text="You haven't confirmed conditions and paid yet"
            />
          )}
          {status === "Commission paid" && (
            <DotStatus
              containerClassName="text-sm"
              color="success"
              text="You've paid, and confirmed verification conditions"
            />
          )}
          {status === "Kyc passed" && (
            <DotStatus containerClassName="text-sm" color="#7355D7" text="You’ve already gone verification procedure" />
          )}
          {status === "Kyc failed" && (
            <DotStatus
              containerClassName="text-sm"
              color="error"
              text="You’ve didn't get a pass due to non-compliance with conditions"
            />
          )}
        </div>
      </section>
      <section className="mt-4 flex flex-col">
        <h2 className="mt-4 place-self-center text-xl font-bold text-rentality-secondary">Step 2</h2>
        <p className="mt-2 place-self-center">Get verification procedure</p>
        <RntButton
          className="mt-2 w-full"
          disabled={!(status === "Commission paid" || status === "Kyc passed")}
          onClick={passKyc}
        >
          Get a driver license verified
        </RntButton>
        <div className="mt-2">
          {(status === "Not paid" || status === "Commission paid") && (
            <DotStatus containerClassName="text-sm" color="#FFFF00" text="You haven't been verified procedure yet" />
          )}
          {status === "Kyc passed" && (
            <DotStatus containerClassName="text-sm" color="success" text="You driver license verified" />
          )}
          {status === "Kyc failed" && (
            <DotStatus containerClassName="text-sm" color="error" text="Your driver license not verified" />
          )}
          <p className="cursor-pointer text-sm underline" onClick={openIssueReasons}>
            See possible reasons refusal to issue a pass
          </p>
        </div>
      </section>
      <RntButton className="mt-4 place-self-center" onClick={handleCancelClick}>
        Close
      </RntButton>
    </section>
  );
}

export default CustomCivicForm;
