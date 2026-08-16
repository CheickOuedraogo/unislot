import type { ActionResult } from "@/lib/actions/auth";

type AlertProps = {
  state: ActionResult;
  variant?: "filled" | "soft";
};

export function Alert({ state, variant = "filled" }: AlertProps) {
  if (!state.success && !state.error) return null;
  const errorClass =
    variant === "soft" ? "text-error bg-error-container" : "text-on-error bg-error";
  return (
    <p
      className={`font-body-sm text-body-sm px-3 py-2 rounded ${
        state.success ? "text-on-success bg-success" : errorClass
      }`}
    >
      {state.success ?? state.error}
    </p>
  );
}
