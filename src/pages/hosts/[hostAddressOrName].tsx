import Layout from "@/components/layout/layout";
import { useRouter } from "next/router";
import { isEmpty } from "@/utils/string";
import PublicListingItem from "@/components/hosts/publicListingItem";
import useHostPublicListings from "@/hooks/host/useHostPublicListings";
import { useTranslation } from "react-i18next";

export default function HostPublicInfo() {
  const router = useRouter();

  const { hostAddressOrName: hostQuery } = router.query;
  const hostAddressOrName = hostQuery && typeof hostQuery === "string" ? hostQuery : "";
  const [isLoading, hostListings] = useHostPublicListings(hostAddressOrName);
  const { t } = useTranslation();

  if (isEmpty(hostAddressOrName))
    return (
      <Layout>
        <div className="flex flex-col text-2xl">{t("hosts.invalid_addr")}</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="flex flex-col">
        <div id="page-title" className="flex flex-row items-center justify-between">
          <div className="text-2xl">
            <strong>{t("hosts.listings", { address: hostAddressOrName })}</strong>
          </div>
        </div>
        {isLoading ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            {t("common.info.loading")}
          </div>
        ) : (
          <div className="my-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
            {hostListings != null && hostListings.length > 0 ? (
              hostListings.map((value) => {
                return <PublicListingItem key={value.carId} carInfo={value} t={t} />;
              })
            ) : (
              <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
                {t("hosts.no_cars")}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
