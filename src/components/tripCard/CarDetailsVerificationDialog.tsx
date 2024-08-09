import RntButton from "../common/rntButton";

function CarDetailsVerificationDialog({
  handleConfirmCarDetailsClick,
  handleCancelClick,
}: {
  handleConfirmCarDetailsClick: () => Promise<void>;
  handleCancelClick: () => void;
}) {
  return (
    <section className="flex flex-col md:px-4">
      <h1 className="place-self-center text-xl font-bold text-rentality-secondary">Car details verification</h1>{" "}
      <section className="mt-4 flex flex-col">
        <p className="mt-2 place-self-center">
          By clicking &quot;Confirm&quot; button I confirm that the car I rented is real and corresponds to the
          characteristics and photos from the site
        </p>
      </section>
      <div className="mt-4 flex flex-row gap-4 place-self-center">
        <RntButton onClick={handleConfirmCarDetailsClick}>Confirm</RntButton>
        <RntButton onClick={handleCancelClick}>Close</RntButton>
      </div>
    </section>
  );
}

export default CarDetailsVerificationDialog;
