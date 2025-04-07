import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import useFetchPlatformPercentage from "../hooks/useFetchPercentage";
import RntCarMakeSelect from "@/components/common/rntCarMakeSelect";
import { Controller, FieldValues, SubmitHandler, useForm } from "react-hook-form";
import * as React from "react";
import CarAddPhoto from "@/components/host/carEditForm/CarAddPhoto";
import RntValidationError from "@/components/common/RntValidationError";
import { TFunction } from "@/utils/i18n";
import RntCarModelSelect from "@/components/common/rntCarModelSelect";
import RntCarYearSelect from "@/components/common/rntCarYearSelect";
import { useRouter } from "next/navigation";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { DimoCarResponseWithTimestamp } from "@/features/dimo/hooks/useDimo";
import RntButton from "@/components/common/rntButton";
import useCreateInvestCar from "@/features/invest/hooks/useCreateInvestCar";
import { formatFloatInput } from "@/utils/formatFloatInput";

function CreateInvestmentPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const { mutateAsync: createInvest } = useCreateInvestCar();
  const { showError, showSuccess } = useRntSnackbars();

  const { control, handleSubmit, formState } = useForm({
    defaultValues: {
      brand: "",
      model: "",
      releaseYear: 2001,
      images: [],
    },
  });

  let dimoData: DimoCarResponseWithTimestamp | undefined;

  const { errors, isSubmitting } = formState;

  const t_car: TFunction = (name, options) => {
    return t("vehicles." + name, options);
  };

  const onFormSubmit: SubmitHandler<FieldValues> = async (formData) => {
    const result = await createInvest({
      images: formData.images,
      brand: formData.brand,
      model: formData.model,
      releaseYear: formData.releaseYear,
      carPrice: Math.floor(Number(carPrice) * 1e18),
      hostPercents: Number(hostPercentage),
      nftName: "",
      nftSym: "",
    });

    if (result.ok) {
      if (dimoData) {
        localStorage.removeItem("dimo");
      }
      showSuccess(t("vehicles.car_invested"));
      showSuccess(t("vehicles.successfully_listed"));
      router.push("/host/invest");
    } else {
      if (result.error.message === "NOT_ENOUGH_FUNDS") {
        showError(t("common.add_fund_to_wallet"));
      } else {
        showError(t("vehicles.saving_failed"));
      }
    }
  };

  const [selectedMakeID, setSelectedMakeID] = useState<string>("");
  const [selectedModelID, setSelectedModelID] = useState<string>("");
  const [carPrice, setCarPrice] = useState<number | string>(0);
  const [hostPercentage, setHostPercentage] = useState<number | string>(0);
  const { data: platformPercentage } = useFetchPlatformPercentage();
  const [investorsPercentage, setInvestorsPercentage] = useState<number | string>(0);

  const handleInputCarPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    value = formatFloatInput(value);

    setCarPrice(value);
  };

  const handleHostPercentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHostPercentage(value === "" ? "" : Number.parseInt(value));
  };

  useEffect(() => {
    setInvestorsPercentage(Math.round(100 - Number(platformPercentage) - Number(hostPercentage)));
  }, [hostPercentage, platformPercentage]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <div>
        <div className="mb-4 gap-4 text-lg">
          <strong>{"Investment Info"}</strong>
        </div>
        <div className="flex flex-wrap gap-4">
          <RntInputTransparent
            className="no-spin lg:w-60"
            label={"Car price in ETH"}
            placeholder="0"
            type="number"
            value={carPrice}
            onChange={handleInputCarPriceChange}
          />

          <RntInputTransparent
            className="lg:w-60"
            label={"Host percentage"}
            placeholder="0"
            value={hostPercentage}
            onChange={handleHostPercentsChange}
          />

          <RntInputTransparent
            className="lg:w-60"
            label={"Platform percentage"}
            placeholder="0"
            readOnly={true}
            value={platformPercentage}
          />

          <RntInputTransparent
            className="lg:w-60"
            label={"Investors percentage"}
            placeholder="0"
            readOnly={true}
            value={investorsPercentage}
          />
        </div>
        <div className="mb-4 gap-4 pl-4 text-lg text-[#FFFFFF70]">{t("invest.new_nft_info")}</div>
      </div>

      <div className="mt-4">
        <div className="mb-4 pl-4 text-lg">
          <strong>{t_car("car")}</strong>
        </div>
        <div className="flex flex-wrap gap-4">
          <Controller
            name="brand"
            control={control}
            defaultValue={dimoData?.definition?.make || ""}
            render={({ field: { onChange, value } }) => (
              <RntCarMakeSelect
                id="brand"
                isTransparentStyle={true}
                className="lg:min-w-[17ch]"
                label={t_car("brand")}
                value={value}
                onMakeSelect={(newID, newMake) => {
                  onChange(newMake);
                  setSelectedMakeID(newID);
                }}
                validationError={errors.brand?.message?.toString()}
              />
            )}
          />
          <Controller
            name="model"
            control={control}
            defaultValue={dimoData?.definition?.model || ""}
            render={({ field: { onChange, value } }) => (
              <RntCarModelSelect
                id="model"
                isTransparentStyle={true}
                className="lg:min-w-[15ch]"
                label={t_car("model")}
                make_id={selectedMakeID}
                value={value}
                onModelSelect={(newID: string, newModel) => {
                  onChange(newModel);
                  setSelectedModelID(newID);
                }}
                validationError={errors.model?.message?.toString()}
              />
            )}
          />
          <Controller
            name="releaseYear"
            control={control}
            defaultValue={dimoData ? Number.parseInt(dimoData.definition.year) : 2001}
            render={({ field: { onChange, value } }) => (
              <RntCarYearSelect
                id="releaseYear"
                isTransparentStyle={true}
                className="lg:min-w-[12ch]"
                label={t_car("release")}
                make_id={selectedMakeID}
                model_id={selectedModelID}
                value={value}
                onYearSelect={(newYear) => {
                  onChange(newYear);
                }}
                validationError={errors.releaseYear?.message?.toString()}
              />
            )}
          />
        </div>
      </div>

      <Controller
        name="images"
        control={control}
        render={({ field }) => (
          <>
            <CarAddPhoto
              carImages={field.value}
              readOnly={false}
              onCarImagesChanged={(newValue) => {
                field.onChange(newValue);
              }}
            />
            <RntValidationError validationError={errors.images?.message?.toString()} />
          </>
        )}
      />

      <div className="mb-8 mt-8 flex flex-row justify-between gap-4 sm:justify-start">
        <RntButton
          type="button"
          className="h-14 w-40"
          disabled={isSubmitting}
          onClick={handleSubmit(async (data) => await onFormSubmit(data))}
        >
          {t("common.save")}
        </RntButton>
      </div>
    </form>
  );
}

export default CreateInvestmentPageContent;
