import RntButton from "../common/rntButton";

function CivicIssueReasons({ handleCancelClick }: { handleCancelClick: () => void }) {
  return (
    <section className="flex flex-col md:px-4">
      <h1 className="place-self-center text-rentality-secondary text-xl font-bold">
        Possible reasons refusal to issue a pass
      </h1>
      <h1 className="place-self-center text-xl">{"when checking your driver's license"}</h1>
      <p className="mt-6">При прохождении верификации выявлено хотя бы одно несоответствие требованиям:</p>
      <ul className="mt-4 list-disc ml-4">
        <li>Completed liveness check; and</li>
        <li>Completed wallet ownership verification, или уникальность кошелька; and</li>
        <li>Completed identity document verification; and</li>
        <li>Over the age of 21; and</li>
        <li>
          <p>Not a resident or citizen and not physically located of a blocked or banned location, namely:</p>
          <p className="ml-4">
            Blocked Locations: China, Bangladesh, Central African Republic, Democratic Republic of Congo, Eritrea,
            Guinea-Bissau, Iraq, Lebanon, Libya, Mali, Somalia, Yemen, Myanmar.
          </p>
          <p className="ml-4">Banned Locations: Cuba, Iran, North Korea, Russia, Sudan, South Sudan, Syria, Ukraine.</p>
        </li>
      </ul>
      <RntButton className="mt-6 place-self-center" onClick={handleCancelClick}>
        Got it
      </RntButton>
    </section>
  );
}

export default CivicIssueReasons;
