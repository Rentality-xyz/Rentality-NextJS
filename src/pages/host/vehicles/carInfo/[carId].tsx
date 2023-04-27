import { useRouter } from "next/router";

export default function CarInfo() {
  const router = useRouter();
  const { carId } = router.query;

  if (!carId) return null;

  return (
    <>
      <div></div>
    </>
  );
}
