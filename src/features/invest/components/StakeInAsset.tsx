function StakeInAsset({
  myTokens,
  myInvestingSum,
  t,
}: {
  myTokens: number;
  myInvestingSum: number;
  t: (key: string) => string;
}) {
  return (
    <p className="mt-2 text-rentality-secondary 2xl:text-lg">
      {myTokens <= 0
        ? t("invest.no_stake_in_asset")
        : t("invest.stake_in_asset")
            .replace("{myTokens}", myTokens.toString())
            .replace("{myInvestingSum}", myInvestingSum.toString())}
    </p>
  );
}

export default StakeInAsset;
