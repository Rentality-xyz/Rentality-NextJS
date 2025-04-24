import { generateAiDamageAnalyzeCaseNumber } from "../utils";

export interface AiDamageAnalyzeCase {
  "Case number": string;
  "Full Name": string;
  Email: string;
  Language: "en";
  "Inspection type": "Pre-inspcetion" | "Post-inspection";
  "Date of incident"?: string;
  "VIN number"?: string;
}

export function createAiDamageAnalyzeCase(
  tripId: number,
  chainId: number,
  fullName: string,
  email: string,
  pre: boolean,
  dateOfIncident?: string,
  vinNumber?: string
): AiDamageAnalyzeCase {
  return {
    "Case number": generateAiDamageAnalyzeCaseNumber(chainId, tripId, pre),
    "Full Name": fullName,
    Email: email,
    Language: "en",
    "Inspection type": pre ? "Pre-inspcetion" : "Post-inspection",
    ...(dateOfIncident ? { "Date of incident": dateOfIncident } : {}),
    ...(vinNumber ? { "VIN number": vinNumber } : {}),
    // "Date of incident": dateOfIncident,
    // "VIN number": vinNumber,
  };
}
export type PhotoUrl = string;

export interface AiDamageAnalyzePhoto {
  right?: PhotoUrl;
  back_left?: PhotoUrl;
  back_right?: PhotoUrl;
  back?: PhotoUrl;
  front_side_grilled?: PhotoUrl;
  front_side_hood?: PhotoUrl;
  front_side_left_bumper?: PhotoUrl;
  front_side_left_head_light?: PhotoUrl;
  front_side_right_bumper?: PhotoUrl;
  front_side_right_head_light?: PhotoUrl;
  front_side_windshield?: PhotoUrl;
  left_side_fender?: PhotoUrl;
  left_side_front_left_door?: PhotoUrl;
  left_side_front_left_tyre?: PhotoUrl;
  left_side_front_left_window?: PhotoUrl;
  left_side_quarter_panel?: PhotoUrl;
  left_side_rear_left_door?: PhotoUrl;
  left_side_rear_left_tyre?: PhotoUrl;
  left_side_rear_left_window?: PhotoUrl;
  left_side_middle_window?: PhotoUrl;
  rear_side_left_bumper?: PhotoUrl;
  rear_side_left_tail_light?: PhotoUrl;
  rear_side_right_bumper?: PhotoUrl;
  rear_side_right_tail_light?: PhotoUrl;
  rear_side_trunk?: PhotoUrl;
  rear_side_windshield?: PhotoUrl;
  right_side_fender?: PhotoUrl;
  right_side_front_right_door?: PhotoUrl;
  right_side_front_right_tyre?: PhotoUrl;
  right_side_front_right_window?: PhotoUrl;
  right_side_quarter_panel?: PhotoUrl;
  right_side_rear_right_door?: PhotoUrl;
  right_side_rear_right_tyre?: PhotoUrl;
  right_side_rear_right_window?: PhotoUrl;
  right_side_middle_window?: PhotoUrl;
  roof_left?: PhotoUrl;
  roof_right?: PhotoUrl;
  other_side?: PhotoUrl;
}

export const photoTypes: { label: string; value: string }[] = Object.entries({
  Right: "right",
  "Back left": "back_left",
  "Back right": "back_right",
  Back: "back",
  Grilled: "front_side_grilled",
  Hood: "front_side_hood",
  "Left bumper": "front_side_left_bumper",
  "Left head light": "front_side_left_head_light",
  "Right bumper": "front_side_right_bumper",
  "Right head light": "front_side_right_head_light",
  Windshield: "front_side_windshield",
  Fender: "left_side_fender",
  Door: "left_side_front_left_door",
  Tyre: "left_side_front_left_tyre",
  Window: "left_side_front_left_window",
  "Quarter Panel": "left_side_quarter_panel",
  "Left tail light": "rear_side_left_tail_light",
  "Right tail light": "rear_side_right_tail_light",
  Trunk: "rear_side_trunk",
  "Roof Left": "roof_left",
  "Roof Right": "roof_right",
  "Other side": "other_side",
}).map(([label, value]) => ({ label, value }));
