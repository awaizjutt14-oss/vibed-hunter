import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl text-sm font-semibold tracking-[0.01em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-emerald-300/15 bg-[linear-gradient(180deg,rgba(73,255,182,0.96),rgba(36,212,138,0.88))] text-black shadow-[0_18px_42px_rgba(73,255,182,0.22)] hover:-translate-y-0.5 hover:shadow-[0_22px_54px_rgba(73,255,182,0.28)]",
        secondary:
          "border border-white/10 bg-white/[0.045] text-secondary-foreground shadow-[0_14px_34px_rgba(0,0,0,0.22)] hover:border-white/18 hover:bg-white/[0.075] hover:-translate-y-0.5",
        ghost:
          "border border-transparent bg-transparent text-foreground hover:border-white/10 hover:bg-white/[0.05]",
        danger: "border border-red-400/15 bg-danger text-danger-foreground hover:opacity-90"
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-xl px-3.5",
        lg: "h-12 rounded-2xl px-6 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
