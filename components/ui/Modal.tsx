"use client";

import { useEffect, useId } from "react";
import { Icon } from "./Icon";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function Modal({ title, onClose, children, footer }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-overlay"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
          <h2 id={titleId} className="font-headline-md text-headline-md text-on-surface">
            {title}
          </h2>
          <button
            aria-label="Fermer"
            className="text-secondary hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
