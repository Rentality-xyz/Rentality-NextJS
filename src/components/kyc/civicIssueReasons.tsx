import RntButton from "../common/rntButton";

function CivicIssueReasons({ handleCancelClick }: { handleCancelClick: () => void }) {
  return (
    <section className="flex flex-col md:px-4">
      <h1 className="place-self-center text-xl font-bold text-rentality-secondary">
        Possible reasons for refusal to issue a pass
      </h1>
      <h1 className="place-self-center text-xl">{"while checking your driver's license"}</h1>
      <p className="mt-6">At least one case of non-compliance was identified during verification:</p>
      <ul className="ml-4 mt-4 list-disc">
        <li>Not completed liveness check;</li>
        <li>Not completed verification of wallet ownership or the uniqueness of the wallet; </li>
        <li>Not completed identity document verification; </li>
        <li>Being below the age of 21;</li>
        <li>
          <p>Being a resident or citizen and physically located in a blocked or banned location, namely:</p>
          <p className="ml-4">
            Blocked Locations: China, Bangladesh, Central African Republic, Democratic Republic of Congo, Eritrea,
            Guinea-Bissau, Iraq, Lebanon, Libya, Mali, Somalia, Yemen, Myanmar.
          </p>
          <p className="ml-4">Banned Locations: Cuba, Iran, North Korea, Russia, Sudan, South Sudan, Syria.</p>
        </li>
      </ul>
      <RntButton className="mt-6 place-self-center" onClick={handleCancelClick}>
        Got it
      </RntButton>
    </section>
  );
}

export default CivicIssueReasons;
