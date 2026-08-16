export const inputClass =
  "w-full border border-outline-variant rounded bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary";

export const inputClassLg =
  "w-full border border-outline rounded-lg px-3 py-2 font-body-sm text-body-sm bg-surface-container-lowest text-on-surface placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary";

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

export function Field({ label, children }: FieldProps) {
  return (
    <div>
      <label className="block font-label-caps text-label-caps text-secondary mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
