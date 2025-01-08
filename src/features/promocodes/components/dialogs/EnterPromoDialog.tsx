import RntButton from "@/components/common/rntButton";
import RntInput from "@/components/common/rntInput";
import React, { useReducer } from "react";
import { useTranslation } from "react-i18next";
import useCheckPromo from "../../hooks/useCheckPromo";
import { useForm } from "react-hook-form";
import { enterPromoFormSchema, EnterPromoFormValues } from "../../models/enterPromoFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { PROMOCODE_MAX_LENGTH } from "@/utils/constants";

type DialogStatus = "NONE" | "LOADING" | "SUCCESS" | "ERROR";

enum PromoActionType {
  RESET = "RESET",
  LOADING = "LOADING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

type PromoAction =
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

type PromoState =
  | {
      status: Exclude<DialogStatus, "SUCCESS">;
    }
  | {
      status: Extract<DialogStatus, "SUCCESS">;
      promo: { code: string; value: number };
    };

function reducer(state: PromoState, action: PromoAction): PromoState {
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

interface EnterPromoDialogProps {
  days: number;
  priceDiscountable: number;
  priceNotDiscountable: number;
  createTripRequest: (promocode?: string) => Promise<void>;
}

function EnterPromoDialog({ days, priceDiscountable, priceNotDiscountable, createTripRequest }: EnterPromoDialogProps) {
  const { checkPromo } = useCheckPromo();
  const [state, dispatch] = useReducer(reducer, { status: "NONE" });
  const { register, handleSubmit, formState } = useForm<EnterPromoFormValues>({
    resolver: zodResolver(enterPromoFormSchema),
  });
  const { t } = useTranslation();

  const { errors, isSubmitting } = formState;

  async function onFormSubmit(formData: EnterPromoFormValues) {
    dispatch({ type: PromoActionType.LOADING });

    const result = await checkPromo(formData.enteredPromo);

    if (!result.ok) {
      dispatch({ type: PromoActionType.ERROR });
    } else {
      dispatch({ type: PromoActionType.SUCCESS, payload: { code: formData.enteredPromo, value: result.value.value } });
    }
  }

  async function handleCreateTripRequest() {
    createTripRequest(state.status === "SUCCESS" ? state.promo.code : undefined);
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}>
      <RntInput
        label={t("promo.input_label")}
        placeholder={t("promo.input_hint")}
        {...register("enteredPromo", {
          onChange: (e) => {
            dispatch({ type: PromoActionType.RESET });

            const value = e.target.value;
            if (value !== undefined && typeof value === "string" && value.length >= PROMOCODE_MAX_LENGTH) {
              handleSubmit(async (data) => await onFormSubmit(data))();
            }
          },
        })}
        validationError={errors.enteredPromo?.message}
      />
      <div>
        {state.status === "SUCCESS" && (
          <>
            <p>{t("promo.promo_success_1", { value: state.promo.value })}</p>
            <p className="text-sm">{t("promo.promo_success_2")}</p>
          </>
        )}
        {state.status === "ERROR" && <p className="text-rentality-alert-text">{t("promo.promo_error")}</p>}
      </div>
      <RntButton
        className="place-self-center whitespace-pre-line"
        type="button"
        disabled={isSubmitting || state.status === "LOADING"}
        onClick={handleCreateTripRequest}
      >
        {state.status === "SUCCESS"
          ? t("promo.button_promo_text", {
              price: displayMoneyWith2Digits(
                getPromoPrice(priceDiscountable, state.promo.value) + priceNotDiscountable
              ),
            })
          : t("promo.button_default_text", {
              days: days,
              price: displayMoneyWith2Digits(priceDiscountable + priceNotDiscountable),
            })}
      </RntButton>
    </form>
  );
}

function getPromoPrice(price: number, promoValue: number) {
  promoValue = Math.max(promoValue, 0);
  promoValue = Math.min(promoValue, 100);

  return (price * (100 - promoValue)) / 100;
}

export default EnterPromoDialog;
