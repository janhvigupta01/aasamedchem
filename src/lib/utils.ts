import { Decimal } from "@prisma/client/runtime/library";

export const CONVERSION_RATES = {
  // Base is G
  KG_TO_G: 1000,
  G_TO_KG: 0.001,
  // Base is ML
  L_TO_ML: 1000,
  ML_TO_L: 0.001,
  // Base is COUNT
  COUNT_TO_COUNT: 1,
};

export const DISPLAY_UNITS = {
  G: ["g", "kg"],
  ML: ["mL", "L"],
  COUNT: ["unit"],
};

export function convertToBaseUnit(qty: number, requestedUnit: string, baseUnit: string): number {
  if (baseUnit === "G" && requestedUnit === "kg") {
    return qty * CONVERSION_RATES.KG_TO_G;
  }
  if (baseUnit === "ML" && requestedUnit === "L") {
    return qty * CONVERSION_RATES.L_TO_ML;
  }
  // G -> g, ML -> mL, COUNT -> unit
  return qty;
}

export function formatINR(amount: Decimal | number): string {
  const num = typeof amount === "number" ? amount : amount.toNumber();
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}
