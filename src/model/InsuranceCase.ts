export type InsuranceCase = {
  iCase: string;
  pre: boolean;
};

export type InsuranceCaseDTO = {
  iCase: InsuranceCase;
  url: string;
  caseResponse?: CaseResponse;
};

type CaseDetails = {
  item_no: string;
  car_part: string;
  side_1: string;
  side_2: string;
  damage: string;
  confidence: string;
  treatment: string;
  part_cost: string;
  paint_hour: string;
  paint_material_cost: string;
  labour_hour: string;
  labour_cost: string;
};

type CaseData = {
  id: number;
  case_number: string;
  vin_number: string | null;
  car_type: string | null;
  p_labor_rate: string;
  labor_rate: string;
  details: CaseDetails[];
  sub_total_part: string;
  sub_total_paint: string;
  sub_total_labor: string;
  sub_total: string;
  tax: string;
  total: string;
};

type CaseResponse = {
  case_token: string;
  pdf_url: string;
  data: CaseData;
};
