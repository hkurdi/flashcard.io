import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { loadStripe } from "@stripe/stripe-js"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getStripe = () => {
  let stripePromise: any;
    if (!stripePromise) {
      stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");
    }
    return stripePromise;
}