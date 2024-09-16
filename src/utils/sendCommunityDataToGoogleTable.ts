import { Err, Ok, Result } from "@/model/utils/result";
import { isEmpty } from "./string";

interface CommunityData {
  email: string;
}

interface GoogleTableResponse {
  result: string;
  error?: {
    name: string;
  };
}

export default async function sendCommunityDataToGoogleTable(data: CommunityData): Promise<Result<boolean, string>> {
  if (!data || isEmpty(data.email)) {
    return Err("Email is empty");
  }

  const url = `https://script.google.com/macros/s/AKfycbxzDkbnBiEaJ077gx_steYQRV-ius8pYak1slbdLHwZHcXyXlUAvN21mdcmD6LVhj6N/exec?GoogleSheetId=1x5Zu_7JyaiaXk7mZ8FXXZ09n1YnRb6zbtUz7iLpoGzM&email=${data.email}`;

  try {
    const response = await fetch(url);
    const json = (await response.json()) as GoogleTableResponse;

    if (response.ok) {
      if (json.result === "success") {
        return Ok(true);
      } else {
        return Err(json.error?.name || "Unknown error");
      }
    } else {
      return Err(JSON.stringify(json));
    }
  } catch (error) {
    console.error("Error sending data to Google Table:", error);
    return Err("An error occurred while sending data.");
  }
}
