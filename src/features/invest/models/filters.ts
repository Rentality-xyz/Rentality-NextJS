import { FilterDefinition } from "@/model/filters";

export type InvestForUserFilterKey = "invest.filter_for_user";
export type InvestForUserFilterValueKey =
  | "all_assets"
  | "available_to_invest"
  | "my_investments"
  | "ready_to_claim"
  | "actually_listed";

export const investForUserFilters: FilterDefinition<InvestForUserFilterValueKey> = {
  key: "invest.filter_for_user",
  options: [
    { key: "all_assets" },
    { key: "available_to_invest" },
    { key: "my_investments" },
    { key: "ready_to_claim" },
    { key: "actually_listed" },
  ],
};

export type InvestForInvestorFilterKey = "invest.filter_for_investor";
export type InvestForInvestorFilterValueKey =
  | "all_assets"
  | "available_to_invest"
  | "fully_tokenized"
  | "ready_for_listing"
  | "actually_listed";

export const investForInvestorFilters: FilterDefinition<InvestForInvestorFilterValueKey> = {
  key: "invest.filter_for_investor",
  options: [
    { key: "all_assets" },
    { key: "available_to_invest" },
    { key: "fully_tokenized" },
    { key: "ready_for_listing" },
    { key: "actually_listed" },
  ],
};
