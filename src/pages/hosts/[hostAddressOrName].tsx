import Layout from "@/components/layout/layout";
import { useRouter } from "next/router";
import { isEmpty } from "@/utils/string";
import PublicListingItem from "@/components/hosts/publicListingItem";
import useHostPublicListings from "@/hooks/host/useHostPublicListings";

export default function HostPublicInfo() {
  const router = useRouter();
  const { hostAddressOrName: hostQuery } = router.query;
  const hostAddressOrName = hostQuery && typeof hostQuery === "string" ? hostQuery : "";
  const [isLoading, hostListings] = useHostPublicListings(hostAddressOrName);

  if (isEmpty(hostAddressOrName))
    return (
      <Layout>
        <div className="flex flex-col text-2xl">Host address is invalid</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="flex flex-col">
        <div id="page-title" className="flex flex-row justify-between items-center">
          <div className="text-2xl">
            <strong>Listings of the host {hostAddressOrName}:</strong>
          </div>
        </div>
        {isLoading ? (
          <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 my-4">
            {hostListings != null && hostListings.length > 0 ? (
              hostListings.map((value) => {
                return <PublicListingItem key={value.carId} carInfo={value} />;
              })
            ) : (
              <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
                Host does not have any listed car
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
