"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { inputClassLg } from "@/components/ui/Field";

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  inputClassName?: string;
};

export function PasswordInput({
  className = "",
  inputClassName = inputClassLg,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        style={{ paddingRight: "2.5rem" }}
        className={`${inputClassName} ${className}`}
        {...props}
      />
      <button
        type="button"
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        title={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-primary transition-colors"
      >
        <Icon name={visible ? "visibility_off" : "visibility"} size={20} />
      </button>
    </div>
  );
}
