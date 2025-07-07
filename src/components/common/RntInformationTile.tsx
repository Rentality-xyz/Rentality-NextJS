// InformationTile.tsx
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
  <div className="w-full max-w-xs rounded-2xl px-6 py-4" style={{ background: VARIANT_BG[variant] }}>
    <p className="text-2xl font-semibold leading-none text-white">{amount}</p>
    <p className="mt-1 text-sm text-white">{label}</p>
  </div>
);

export default RntInformationTile;
