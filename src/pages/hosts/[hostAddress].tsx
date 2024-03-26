import Layout from "@/components/layout/layout";
import { useRouter } from "next/router";
import { isEmpty } from "@/utils/string";
import PublicListingItem from "@/components/hosts/publicListingItem";
import useHostPublicListings from "@/hooks/host/useHostPublicListings";

const validateWalletAddress = (value: string) => {
  return !isEmpty(value) && value.length === 42 && value.toLowerCase().startsWith("0x");
};
const getHostAddressFromQuery = (query: string | string[] | undefined): string => {
  return query && typeof query === "string" && validateWalletAddress(query) ? query : "";
};

export default function HostPublicInfo() {
  const router = useRouter();
  const { hostAddress: hostAddressQuery } = router.query;
  const hostAddress = getHostAddressFromQuery(hostAddressQuery);
  const [isLoading, hostListings] = useHostPublicListings(hostAddress);

  if (isEmpty(hostAddress))
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
            <strong>Listings of the host {hostAddress}:</strong>
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
