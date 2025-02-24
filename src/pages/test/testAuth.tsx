import PageTitle from "@/components/pageTitle/pageTitle";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";

const TEST_EXPIRED_TOKEN =
  "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkgwcEM4N2JxTGx3Yk5WYUFtQTM1ZGczY2VoMVNjaWhzX21INjNWZEQwaXMifQ.eyJzaWQiOiJjbTdhcHhhNXgwMDdqMTI0YXl2aG9heXMwIiwiaXNzIjoicHJpdnkuaW8iLCJpYXQiOjE3Mzk4OTcyOTEsImF1ZCI6ImNtNDAxeGcyZjA1ZGUxMnYwcHRvaHpic3QiLCJzdWIiOiJkaWQ6cHJpdnk6Y203YWxmbWJ4MDJ1YmRjbnBpY3JiMnZvcCIsImV4cCI6MTczOTkwMDg5MX0.XHnfHC6Pa28z4WRa5oVObGz_v1k21Dp6akxPaaP9E5xBphjLqUUUDotl-IY2hk2QCcx5vLTPAhge4y-jVo-B3g";

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
