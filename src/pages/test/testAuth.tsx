import PageTitle from "@/components/pageTitle/pageTitle";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";

function TestAuth() {
  const { getAccessToken } = usePrivy();

  useEffect(() => {
    const sendTestRequest = async () => {
      const accessToken = await getAccessToken();
      //const accessToken = TEST_EXPIRED_TOKEN;

      if (!accessToken) {
        return;
      }

      fetch("/api/test/testAuth", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    };

    sendTestRequest();
  }, [getAccessToken]);

  return (
    <>
      <PageTitle title="testAuth" />
    </>
  );
}

TestAuth.allowAnonymousAccess = true;

export default TestAuth;
