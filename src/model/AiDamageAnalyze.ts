export interface CreateCase {
    "Case number": string;         
    "Full Name": string;           
    "Email": string;               
    "Date of incident"?: string;   
    "VIN number"?: string;         
    "Language": "en";            
  }

  export function createCase(
    caseNumber: string,
    fullName: string,
    email: string,
    dateOfIncident?: string,
    vinNumber?: string
  ): CreateCase {
    return {
      "Case number": caseNumber,
      "Full Name": fullName,
      "Email": email,
      "Language": "en",
      ...(dateOfIncident ? { "Date of incident": dateOfIncident } : {}),
      ...(vinNumber ? { "VIN number": vinNumber } : {}),
    };
  }
  export type Base64String = string;

  export interface AiDamageAnalyzePhoto {
    right?: Base64String;
    back_left?: Base64String;
    back_right?: Base64String;
    back?: Base64String;
    front_side_grilled?: Base64String;
    front_side_hood?: Base64String;
    front_side_left_bumper?: Base64String;
    front_side_left_head_light?: Base64String;
    front_side_right_bumper?: Base64String;
    front_side_right_head_light?: Base64String;
    front_side_windshield?: Base64String;
    left_side_fender?: Base64String;
    left_side_front_left_door?: Base64String;
    left_side_front_left_tyre?: Base64String;
    left_side_front_left_window?: Base64String;
    left_side_quarter_panel?: Base64String;
    left_side_rear_left_door?: Base64String;
    left_side_rear_left_tyre?: Base64String;
    left_side_rear_left_window?: Base64String;
    left_side_middle_window?: Base64String;
    rear_side_left_bumper?: Base64String;
    rear_side_left_tail_light?: Base64String;
    rear_side_right_bumper?: Base64String;
    rear_side_right_tail_light?: Base64String;
    rear_side_trunk?: Base64String;
    rear_side_windshield?: Base64String;
    right_side_fender?: Base64String;
    right_side_front_right_door?: Base64String;
    right_side_front_right_tyre?: Base64String;
    right_side_front_right_window?: Base64String;
    right_side_quarter_panel?: Base64String;
    right_side_rear_right_door?: Base64String;
    right_side_rear_right_tyre?: Base64String;
    right_side_rear_right_window?: Base64String;
    right_side_middle_window?: Base64String;
    roof_left?: Base64String;
    roof_right?: Base64String;
    other_side?: Base64String;
  }
  
  

  export interface PhotoTypeToAiDamageAnalyzeKeys {
    "Right": "right";
    "Back left": "back_left";
    "Back right": "back_right";
    "Back": "back";
    "Grilled": "front_side_grilled";
    "Hood": "front_side_hood";
    "Left bumper": "front_side_left_bumper"; 
    "Left head light": "front_side_left_head_light";
    "Right bumper": "front_side_right_bumper";
    "Right head light": "front_side_right_head_light";
    "Windshield": "front_side_windshield";
    "Fender": "left_side_fender";
    "Door": "left_side_front_left_door";
    "Tyre": "left_side_front_left_tyre";
    "Window": "left_side_front_left_window";
    "Quarter Panel": "left_side_quarter_panel";
    "Left tail light": "rear_side_left_tail_light";
    "Right tail light": "rear_side_right_tail_light";
    "Trunk": "rear_side_trunk";
    "Roof Left": "roof_left";
    "Roof Right": "roof_right";
    "Other side": "other_side";
  }