type DialogStatus = "NONE" | "LOADING" | "SUCCESS" | "ERROR";

export enum PromoActionType {
  RESET = "RESET",
  LOADING = "LOADING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export type PromoAction =
  | {
      type: PromoActionType.SUCCESS;
      payload: { code: string; value: number };
    }
  | {
      type: PromoActionType.RESET;
    }
  | {
      type: PromoActionType.LOADING;
    }
  | {
      type: PromoActionType.ERROR;
    };

export type PromoState =
  | {
      status: Exclude<DialogStatus, "SUCCESS">;
    }
  | {
      status: Extract<DialogStatus, "SUCCESS">;
      promo: { code: string; value: number };
    };

export function promoCodeReducer(state: PromoState, action: PromoAction): PromoState {
  const { type } = action;
  switch (type) {
    case PromoActionType.RESET:
      return { status: "NONE" };
    case PromoActionType.LOADING:
      return { status: "LOADING" };
    case PromoActionType.SUCCESS:
      return { status: "SUCCESS", promo: action.payload };
    case PromoActionType.ERROR:
      return { status: "ERROR" };
    default:
      return state;
  }
}
