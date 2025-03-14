function ExpectCompletedTrips({ t }: { t: (key: string) => string }) {
  return (
    <p className="mx-auto mt-6 w-5/6 text-center text-[#FFFFFF70] 2xl:text-lg">{t("invest.expect_completed_trips")}</p>
  );
}

export default ExpectCompletedTrips;
