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
      <h1 className="place-self-center text-rentality-secondary text-xl font-bold">Car details verification</h1>{" "}
      <section className="flex flex-col mt-4">
        <p className="place-self-center mt-2">
          By clicking &quot;Confirm&quot; button I confirm that the car I rented is real and corresponds to the
          characteristics and photos from the site
        </p>
      </section>
      <div className="flex flex-row gap-4  mt-4 place-self-center">
        <RntButton onClick={handleConfirmCarDetailsClick}>Confirm</RntButton>
        <RntButton onClick={handleCancelClick}>Close</RntButton>
      </div>
    </section>
  );
}

export default CarDetailsVerificationDialog;
