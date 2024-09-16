// Define the types for the CommunityData and GoogleTableResponse interfaces
interface CommunityData {
  email: string;
}

interface GoogleTableResponse {
  result: string;
  error?: {
    name: string;
  };
}

export default async function sendCommunityDataToGoogleTable(data: CommunityData): Promise<void> {
  const url = `https://script.google.com/macros/s/AKfycbxzDkbnBiEaJ077gx_steYQRV-ius8pYak1slbdLHwZHcXyXlUAvN21mdcmD6LVhj6N/exec?GoogleSheetId=1x5Zu_7JyaiaXk7mZ8FXXZ09n1YnRb6zbtUz7iLpoGzM&email=${data.email}`;

  try {
    const response = await fetch(url);
    const json = (await response.json()) as GoogleTableResponse;

    if (response.ok) {
      if (json.result === "success") {
        window.alert("Success");
      } else {
        // window.alert(json.error?.name || "Unknown error");
      }
    } else {
      window.alert(JSON.stringify(json));
    }
  } catch (error) {
    console.error("Error sending data to Google Table:", error);
    window.alert("An error occurred while sending data.");
  }
}
