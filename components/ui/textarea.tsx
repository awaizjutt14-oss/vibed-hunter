import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[120px] w-full rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,13,19,0.92),rgba(7,10,15,0.88))] px-4 py-3.5 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-all duration-300 placeholder:text-muted-foreground/70 focus:border-emerald-300/25 focus:shadow-[0_0_0_4px_rgba(73,255,182,0.08)]",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
