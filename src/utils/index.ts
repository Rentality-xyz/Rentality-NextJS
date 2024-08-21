import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export async function wait(timeInMilliseconds: number) {
  new Promise((res) => setTimeout(res, timeInMilliseconds));
}
