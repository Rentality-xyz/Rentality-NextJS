import { NextApiRequest, NextApiResponse } from "next";
import { createSecret } from "./createSecret";
import axios from "axios";
import { MotionsCloudPhoto } from "@/model/MotionsCloud";

export function imageToBase64(base64String: string) {
    return `data:image/jpeg;base64,${base64String}`;
}

export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
    });
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const {secret, baseUrl} = await createSecret();
    const token = <string>req.query.token!;
    const data = <MotionsCloudPhoto>req.body;
    try {

    const response = await axios.post(
        `${baseUrl}/api/v1/case/${token}/upload_photos`,
        data,
        {
            headers: {
                    'Authorization': `Bearer ${secret.access_token}`, 
                    "Content-Type": "multipart/form-data"
            }
        }
    );


    if(response.status !== 200) {
        console.log('MotionsCloud: failed to upload photo with error: ', response.data.message)
         res.status(500).json({ error: 'MotionsCloud: failed to upload photo with error: ' + response.data.message});
        

         return
     }
     res.status(200).json({success: true})
    }
     catch(e) {
        console.log("MotionsCloud uploading photos error:", e.response.data.message)
        res.status(500).json({ error: 'MotionsCloud: failed to upload photo with error: ' + e.response.data.message});
        return
    }


}
export const photoMap = {
    "Right": "right",
    "Back left": "back_left",
    "Back right": "back_right",
    "Back": "back",
    "Grilled": "front_side_grilled",
    "Hood": "front_side_hood",
    "Left bumper": "front_side_left_bumper",
    "Left head light": "front_side_left_head_light",
    "Right bumper": "front_side_right_bumper",
    "Right head light": "front_side_right_head_light",
    "Windshield": "front_side_windshield",
    "Fender": "left_side_fender",
    "Door": "left_side_front_left_door",
    "Tyre": "left_side_front_left_tyre",
    "Window": "left_side_front_left_window",
    "Quarter Panel": "left_side_quarter_panel",
    "Left tail light": "rear_side_left_tail_light",
    "Right tail light": "rear_side_right_tail_light",
    "Trunk": "rear_side_trunk",
    "Roof Left": "roof_left",
    "Roof Right": "roof_right",
    "Other side": "other_side",
  };
  