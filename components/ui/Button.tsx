import type { ButtonHTMLAttributes } from "react";
import { Icon } from "./Icon";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dangerSolid" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  icon?: string;
  iconFill?: boolean;
  iconClassName?: string;
  iconSize?: number;
  leadingIcon?: boolean;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:brightness-110 border border-primary shadow-sm shadow-primary/30",
  secondary:
    "bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface-container hover:border-outline",
  ghost: "text-secondary hover:text-primary hover:bg-surface-container",
  danger: "text-secondary hover:text-error hover:bg-error-container",
  dangerSolid:
    "bg-error text-on-error hover:brightness-110 border border-error shadow-sm shadow-error/30",
  icon: "text-secondary hover:text-primary hover:bg-surface-container rounded-full",
};

export function Button({
  variant = "primary",
  icon,
  iconFill = false,
  iconClassName = "",
  iconSize,
  leadingIcon = true,
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 font-body-sm text-body-sm font-medium rounded-lg px-4 py-2.5 transition-all duration-150 active:scale-95 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {icon && leadingIcon && (
        <Icon name={icon} fill={iconFill} size={iconSize} className={iconClassName} />
      )}
      {children}
      {icon && !leadingIcon && (
        <Icon name={icon} fill={iconFill} size={iconSize} className={iconClassName} />
      )}
    </button>
  );
}
