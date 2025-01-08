import RntButton from "../common/rntButton";

function CivicConditions({
  commissionFee,
  handleCancelClick,
}: {
  commissionFee: number;
  handleCancelClick: () => void;
}) {
  return (
    <section className="flex flex-col md:px-4">
      <h1 className="place-self-center text-xl font-bold text-rentality-secondary">
        Conditions for Issuing a Civic Pass
      </h1>
      <h1 className="place-self-center text-xl">{"when checking your driver's license"}</h1>
      <p className="mt-6">Below are the requirements for obtaining a new Pass to an End User:</p>
      <ol className="ml-4 list-decimal">
        <li className="mt-1">
          Agreed to Civic’s{" "}
          <a
            className="underline"
            href="https://www.civic.com/legal/terms-and-conditions-uniqueness-v1/"
            target="_blank"
          >
            Terms and Conditions
          </a>
          ,{" "}
          <a className="underline" href="https://www.civic.com/legal/privacy-policy-uniqueness-v1/" target="_blank">
            Privacy Policy
          </a>
          , and{" "}
          <a
            className="underline"
            href="https://www.civic.com/legal/biometric-privacy-notice-uniqueness-v1/"
            target="_blank"
          >
            Biometric Policy
          </a>
        </li>
        <li>Completed the liveness check; and</li>
        <li>Completed wallet ownership verification; and</li>
        <li>Completed identity document verification; and</li>
        <li>To be over the age of 21; and</li>
        <li>
          <p>Not to be a resident or citizen of a blocked or banned location, namely:</p>
          <p>
            Blocked Locations: China, Bangladesh, Central African Republic, Democratic Republic of Congo, Eritrea,
            Guinea-Bissau, Iraq, Lebanon, Libya, Mali, Somalia, Yemen, Myanmar.
          </p>
          <p>Banned Locations: Cuba, Iran, North Korea, Russia, Sudan, South Sudan, Syria.</p>
          <p>and</p>
        </li>
        <li>Not to be physically located in a blocked or banned location.</li>
      </ol>
      <h2 className="mt-6 place-self-center text-xl font-bold text-rentality-secondary">
        Payment for Civic KYC verification procedure
      </h2>
      <p className="mt-4">{`The price to complete one identity and driver's license verification process is $${commissionFee}`}</p>
      <p className="mt-4 font-bold">Attention!</p>
      <p>{`Verification is paid even if you do not pass the verification requirements listed above under "Conditions for Issuing a Civic Pass", payment is non-refundable.`}</p>
      <RntButton className="mt-6 place-self-center" onClick={handleCancelClick}>
        Got it
      </RntButton>
    </section>
  );
}
export default CivicConditions;
