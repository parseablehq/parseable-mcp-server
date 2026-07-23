import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({ variant: _variant, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; children?: ReactNode }) {
  return (
    <button
      className={`inline-flex items-center grow-0 justify-center whitespace-nowrap font-sans rounded-sm text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 ${className ?? ""}`}
      {...props}
    />
  );
}
