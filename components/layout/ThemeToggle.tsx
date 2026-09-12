"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("unislot-theme", next ? "dark" : "light");
    } catch {
      /* localStorage indisponible */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Activer le thème clair" : "Activer le thème sombre"}
      title={dark ? "Thème clair" : "Thème sombre"}
      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95"
    >
      <Icon name={dark ? "light_mode" : "dark_mode"} size={18} />
    </button>
  );
}