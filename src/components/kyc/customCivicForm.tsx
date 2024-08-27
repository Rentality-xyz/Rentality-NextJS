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
        <RntButton className="place-self-center mt-4" onClick={handleCancelClick}>
          Close
        </RntButton>
      </section>
    );

  return (
    <section className="flex flex-col md:px-4">
      <span className="bg-[#FFFF00] bg-[#7355D7]">{/* for tailwind initialization */}</span>
      <h1 className="place-self-center text-rentality-secondary text-xl font-bold">Get verification</h1>{" "}
      <section className="flex flex-col mt-4">
        <h2 className="place-self-center text-rentality-secondary text-xl font-bold">Step 1</h2>
        <p className="place-self-center mt-2">
          Read the{" "}
          <span className="underline cursor-pointer" onClick={openConditions}>
            conditions
          </span>{" "}
          and pay for verification procedures
        </p>
        <RntButton
          className="w-full mt-2 h-16 px-2 sm:px-0 sm:h-12"
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
      <section className="flex flex-col mt-4">
        <h2 className="place-self-center text-rentality-secondary text-xl font-bold mt-4">Step 2</h2>
        <p className="place-self-center mt-2">Get verification procedure</p>
        <RntButton
          className="w-full mt-2"
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
          <p className="underline cursor-pointer text-sm" onClick={openIssueReasons}>
            See possible reasons refusal to issue a pass
          </p>
        </div>
      </section>
      <RntButton className="place-self-center mt-4" onClick={handleCancelClick}>
        Close
      </RntButton>
    </section>
  );
}

export default CustomCivicForm;
