import React, { SelectHTMLAttributes, forwardRef, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, onChange, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const selectRef = useRef<HTMLSelectElement | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e);
    };

    return (
      <div className="relative group">
        <select
          ref={(node) => {
            selectRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={clsx(
            "w-full h-10 px-3 pr-10 rounded-md border border-input bg-input text-sm appearance-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
            "transition-all duration-200 hover:border-ring/50",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className={clsx(
            "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none transition-all duration-300 ease-out",
            isFocused ? "rotate-180 scale-105" : "rotate-0 scale-100"
          )}
        />
      </div>
    );
  }
);

Select.displayName = "Select";
