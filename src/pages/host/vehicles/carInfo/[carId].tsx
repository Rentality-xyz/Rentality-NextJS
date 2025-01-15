import { useRouter } from "next/router";

function CarInfo() {
  const router = useRouter();
  const { carId } = router.query;

  if (!carId) return null;

  return (
    <>
      <div></div>
    </>
  );
}

export default CarInfo;
