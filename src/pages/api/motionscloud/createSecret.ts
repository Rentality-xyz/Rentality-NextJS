import axios from "axios";
export async function createSecret() {
        const baseUrl = process.env.MOTIONSCLOUD_BASE_URL;
        const accountSid = process.env.MOTIONSCLOUD_ACCOUNT_SID;
        const accountSecret = process.env.MOTIONSCLOUD_ACCOUNT_SECRETKEY;

        const response = await axios.post(
            `${baseUrl}/access_token`,
            {},
            {
                headers: {
                    'Account-SID': accountSid,
                    'Account-SecretKey': accountSecret,
                }
            }
        );
    if(response.status !== 200) {
        throw new Error('MotionsCloud: failed to create secret with error: ', response.data)
    }
   return {secret: response.data, baseUrl};

}