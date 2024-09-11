import { useRouter } from "next/router";
import { isEmpty } from "@/utils/string";
import PublicListingItem from "@/components/hosts/publicListingItem";
import useHostPublicListings from "@/hooks/host/useHostPublicListings";
import { useTranslation } from "react-i18next";
import Loading from "@/components/common/Loading";
import PageTitle from "@/components/pageTitle/pageTitle";

export default function HostPublicInfo() {
  const router = useRouter();

  const { hostAddressOrName: hostQuery } = router.query;
  const hostAddressOrName = hostQuery && typeof hostQuery === "string" ? hostQuery : "";
  const [isLoading, hostListings] = useHostPublicListings(hostAddressOrName);
  const { t } = useTranslation();

  if (isEmpty(hostAddressOrName)) return <div className="text-2xl">{t("hosts.invalid_addr")}</div>;

  return (
    <>
      <PageTitle title={t("hosts.listings", { address: hostAddressOrName })} />
      {isLoading && <Loading />}
      {!isLoading && (
        <div className="my-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {hostListings != null && hostListings.length > 0 ? (
            hostListings.map((value) => {
              return <PublicListingItem key={value.carId} carInfo={value} t={t} />;
            })
          ) : (
            <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">{t("hosts.no_cars")}</div>
          )}
        </div>
      )}
    </>
  );
}
