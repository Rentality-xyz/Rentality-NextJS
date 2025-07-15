import React from "react";

type Variant = "violet" | "indigo";

export interface TileProps {
  amount: string; // верхній рядок
  label: string; // нижній рядок
  variant?: Variant; // фон (за замовчуванням violetGradient)
}

const VARIANT_BG: Record<Variant, string> = {
  violet: "#6600CD",
  indigo: "#150947",
};

const RntInformationTile: React.FC<TileProps> = ({ amount, label, variant = "violet" }) => (
  <div className="flex w-72 flex-col justify-center rounded-2xl px-6 py-6" style={{ background: VARIANT_BG[variant] }}>
    <p className="text-3xl font-semibold leading-none text-white">{amount}</p>
    <p className="mt-2 text-lg text-white">{label}</p>
  </div>
);

export default RntInformationTile;
