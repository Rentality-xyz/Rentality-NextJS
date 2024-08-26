import { isEmpty } from "@/utils/string";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { db, storage, loginWithPassword } from "@/utils/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { FIREBASE_DB_NAME } from "@/chat/model/firebaseTypes";
import { ref, uploadBytes } from "firebase/storage";
import { env } from "@/utils/env";
import moment from "moment";

export type RetrieveCivicDataRequest = {
  requestId: string;
};

export type RetrieveCivicDataResponse =
  | {
      success: true;
    }
  | {
      error: string;
    };

type PiiLink = {
  rel: string;
  href: string;
};

type PiiDocData = {
  rel: string;
  data: string;
  mimeType: string;
};

type PiiVerifiedInformation = {
  issueCountry: string;
  name: string;
  email: string;
  dateOfBirth: string;
  dateOfExpiry: string;
  documentType: string;
  documentNumber: string;
  address: string;
  accountId: string;
};

type AllPiiInfo = {
  id: string;
  type: string;
  status: string;
  links: PiiLink[];
  verifiedInformation: PiiVerifiedInformation;
  updateDate: string;
};

const GET_AUTH_TOKEN_URL = "https://auth.civic.com/oauth/token";
const GET_ALL_PIIS_URL = "https://api.civic.com/partner/piirequest/REQUEST_ID";
const UPDATE_STATUS_URL = "https://api.civic.com/partner/piirequest/REQUEST_ID/status";

// export default async function handler(req: NextApiRequest, res: NextApiResponse<ParseLocationResponse>) {
export default async function handler(req: NextApiRequest, res: NextApiResponse<RetrieveCivicDataResponse>) {
  const CIVIC_CLIENT_ID = env.CIVIC_CLIENT_ID;
  if (!CIVIC_CLIENT_ID || isEmpty(CIVIC_CLIENT_ID)) {
    console.error("retrieveCivicData error: CIVIC_CLIENT_ID was not set");
    res.status(500).json({ error: getErrorMessage("retrieveCivicData error: CIVIC_CLIENT_ID was not set") });
    return;
  }

  const CIVIC_CLIENT_SECRET = env.CIVIC_CLIENT_SECRET;
  if (!CIVIC_CLIENT_SECRET || isEmpty(CIVIC_CLIENT_SECRET)) {
    console.error("retrieveCivicData error: CIVIC_CLIENT_SECRET was not set");
    res.status(500).json({ error: getErrorMessage("retrieveCivicData error: CIVIC_CLIENT_SECRET was not set") });
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
    res.status(500).json({ error: getErrorMessage(`authTokenResult error: ${authTokenResult.message}`) });
    return;
  }

  const allPIIsResult = await getAllPIIs(requestId, authTokenResult.accessToken);
  if (!allPIIsResult.success) {
    res.status(500).json({ error: getErrorMessage(`allPIIsResult error: ${allPIIsResult.message}`) });
    return;
  }
  console.log(`PII data was received successfully`);

  const PiiDocDatas = await getPiiDocs(allPIIsResult.response.links, authTokenResult.accessToken);
  if (!PiiDocDatas.success) {
    res.status(500).json({ error: getErrorMessage(`PiiDocDatas error: ${PiiDocDatas.message}`) });
    return;
  }
  console.log(`PII docs were received successfully`);

  const saveDataResult = await savePiiInfoToFirebase(allPIIsResult.response, PiiDocDatas.response);

  console.log(`saveDataResult: ${JSON.stringify(saveDataResult)}`);

  if (!saveDataResult.success) {
    res.status(500).json({ error: getErrorMessage(`saveDataResult error: ${saveDataResult.message}`) });
    return;
  }
  console.log(`PII data was saved successfully`);

  const updateStatusResult = await updateStatus(requestId, true, authTokenResult.accessToken);
  if (!updateStatusResult.success) {
    res.status(500).json({ error: getErrorMessage(`updateStatusResult error: ${updateStatusResult.message}`) });
    return;
  }
  console.log(`Civic status was updated successfully`);

  //console.log(`allPIIsResult result: ${JSON.stringify(allPIIsResult.response)}`);
  //console.log(`piiDocPics result: ${JSON.stringify(piiDocPics)}`);

  res.status(200).json({ success: true });
  return;
}

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
        message: "response does not contain access_token",
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
      if (response.status !== 200) {
        return {
          success: false,
          message: response.statusText,
        } as const;
      }
      return {
        success: true,
        response: { ...response.data, updateDate: moment().toISOString() } as AllPiiInfo,
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
  console.error(`getPIIByLink call link:${link}`);
  return axios
    .get(link, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      responseType: "arraybuffer",
    })
    .then(function (response) {
      return {
        success: true,
        response: { data: response.data, mimeType: response.headers["content-type"] },
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

async function getPiiDocs(links: PiiLink[], authToken: string) {
  const piiDocPicsPromises = links.map(async (link) => {
    const dataResponse = await getPIIByLink(link.href, authToken);
    if (dataResponse.success) {
      return {
        rel: link.rel,
        data: dataResponse.response.data,
        mimeType: dataResponse.response.mimeType,
      } as PiiDocData;
    }
    return { rel: link.rel, data: "", mimeType: "" } as PiiDocData;
  });
  const piiDocPics = await Promise.all(piiDocPicsPromises);

  if (piiDocPics.find((i) => isEmpty(i.data)) !== undefined) {
    return {
      success: false,
      message: "Some docs is not retrived",
    } as const;
  }
  return {
    success: true,
    response: piiDocPics,
  } as const;
}

async function saveDocs(address: string, docs: PiiDocData[]) {
  const saveDocsResultPromise = docs.map(async (doc) => {
    const docRef = ref(storage, `kycdocs/${address}_${doc.rel}.jpg`);
    try {
      console.log(` doc.mimeType: ${doc.mimeType}`);

      const snapshot = await uploadBytes(
        docRef,
        new Blob([doc.data], {
          type: doc.mimeType,
        })
      );
      console.log("saveDocs success:", snapshot.ref.fullPath);
      return { rel: doc.rel, href: snapshot.ref.fullPath };
    } catch (error) {
      console.error("saveDocs error", error);

      return { rel: doc.rel, href: undefined };
    }
  });
  const saveDocsResult = await Promise.all(saveDocsResultPromise);

  if (saveDocsResult.find((i) => i.href === undefined) !== undefined) {
    return {
      success: false,
      message: "saveDocs errors",
    } as const;
  }

  return {
    success: true,
    response: saveDocsResult as PiiLink[],
  } as const;
}

async function savePiiInfoToFirebase(allInfo: AllPiiInfo, docs: PiiDocData[]) {
  if (!db)
    return {
      success: false,
      message: "db is null",
    } as const;
  if (!storage)
    return {
      success: false,
      message: "storage is null",
    } as const;

  const CIVIC_USER_EMAIL = env.CIVIC_USER_EMAIL;
  if (!CIVIC_USER_EMAIL || isEmpty(CIVIC_USER_EMAIL)) {
    console.error("retrieveCivicData error: CIVIC_USER_EMAIL was not set");
    return {
      success: false,
      message: "CIVIC_USER_EMAIL was not set",
    } as const;
  }

  const CIVIC_USER_PASSWORD = env.CIVIC_USER_PASSWORD;
  if (!CIVIC_USER_PASSWORD || isEmpty(CIVIC_USER_PASSWORD)) {
    console.error("retrieveCivicData error: CIVIC_USER_PASSWORD was not set");
    return {
      success: false,
      message: "CIVIC_USER_PASSWORD was not set",
    } as const;
  }

  const user = await loginWithPassword(CIVIC_USER_EMAIL, CIVIC_USER_PASSWORD);
  console.log(`user: ${JSON.stringify(user)}`);

  const savedDocsResult = await saveDocs(allInfo.verifiedInformation.address, docs);

  if (!savedDocsResult.success) {
    return {
      success: false,
      message: "saveDocs error",
    } as const;
  }
  allInfo.links = savedDocsResult.response;

  const kycInfoRef = doc(db, FIREBASE_DB_NAME.kycInfos, allInfo.verifiedInformation.address);
  const kycInfoQuerySnapshot = await getDoc(kycInfoRef);

  if (!kycInfoQuerySnapshot.exists()) {
    await setDoc(kycInfoRef, allInfo);
  } else {
    await updateDoc(kycInfoRef, allInfo);
  }

  return {
    success: true,
  } as const;
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

function getErrorMessage(debugMessage: string) {
  const isDebug = true;
  return isDebug ? debugMessage : "Something went wrong! Please wait a few minutes and try again";
}
