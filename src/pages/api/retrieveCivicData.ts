import { isEmpty } from "@/utils/string";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export type ParseLocationRequest = {
  requestId: string;
};

export type ParseLocationResponse =
  | {
      success: true;
    }
  | {
      error: string;
    };

const GET_AUTH_TOKEN_URL = "https://auth.civic.com/oauth/token";
const GET_ALL_PIIS_URL = "https://api.civic.com/partner/piirequest/REQUEST_ID";
const UPDATE_STATUS_URL = "https://api.civic.com/partner/piirequest/REQUEST_ID/status";

async function getAuthToken(clientId: string, clientSecret: string) {
  const data = JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    audience: "https://api.civic.com/pass",
    grant_type: "client_credentials",
  });
  return axios
    .post(GET_AUTH_TOKEN_URL, data, {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
    })
    .then(function (response) {
      console.log("getAuthToken response", response.data);
      if ("access_token" in response.data) {
        return {
          success: true,
          accessToken: response.data.access_token as string,
        } as const;
      }
      return {
        success: false,
        accessToken: "response does not contain access_token",
      } as const;
    })
    .catch(function (error) {
      console.error("getAuthToken error", error);
      return {
        success: false,
        message: error.message,
      } as const;
    });
}

async function getAllPIIs(requestId: string, authToken: string) {
  return axios
    .get(GET_ALL_PIIS_URL.replace("REQUEST_ID", requestId), {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    })
    .then(function (response) {
      console.log("getAllPIIs response", response.data);
      return {
        success: true,
        response: response.data,
      } as const;
    })
    .catch(function (error) {
      console.error("getAllPIIs error", error);
      return {
        success: false,
        message: error.message,
      } as const;
    });
}

async function getPIIByLink(link: string, authToken: string) {
  return axios
    .get(link, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
    .then(function (response) {
      console.log("getPIIByLink response", response.data);
      return {
        success: true,
        response: response.data,
      } as const;
    })
    .catch(function (error) {
      console.error("getPIIByLink error", error);
      return {
        success: false,
        message: error.message,
      } as const;
    });
}

async function updateStatus(requestId: string, isPassed: boolean, authToken: string) {
  const data = JSON.stringify({
    status: isPassed ? "partner-pass" : "partner-fail",
  });
  return axios
    .put(UPDATE_STATUS_URL.replace("REQUEST_ID", requestId), data, {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    })
    .then(function (response) {
      console.log("updateStatus response", response.data);
      return {
        success: true,
        response: response.data,
      } as const;
    })
    .catch(function (error) {
      console.error("updateStatus error", error);
      return {
        success: false,
        message: error.message,
      } as const;
    });
}

// export default async function handler(req: NextApiRequest, res: NextApiResponse<ParseLocationResponse>) {
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Call started");

  const CIVIC_CLIENT_ID = process.env.CIVIC_CLIENT_ID;
  if (!CIVIC_CLIENT_ID || isEmpty(CIVIC_CLIENT_ID)) {
    console.error("retrieveCivicData error: CIVIC_CLIENT_ID was not set");
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  const CIVIC_CLIENT_SECRET = process.env.CIVIC_CLIENT_SECRET;
  if (!CIVIC_CLIENT_SECRET || isEmpty(CIVIC_CLIENT_SECRET)) {
    console.error("retrieveCivicData error: CIVIC_CLIENT_SECRET was not set");
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  const { requestId: requestIdQuery } = req.query;
  const requestId = typeof requestIdQuery === "string" ? requestIdQuery : "";

  if (isEmpty(requestId)) {
    res.status(400).json({ error: "'requestId' is not provided or empty" });
    return;
  }

  console.log(`Calling retrieveCivicData API with requestId:${requestId}`);
  const authTokenResult = await getAuthToken(CIVIC_CLIENT_ID, CIVIC_CLIENT_SECRET);

  if (!authTokenResult.success) {
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  const allPIIsResult = await getAllPIIs(requestId, authTokenResult.accessToken);
  if (!allPIIsResult.success) {
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  console.log(`return result: ${allPIIsResult.response}`);

  res.status(200).json(allPIIsResult.response);
  return;
}
