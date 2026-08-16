type IconProps = {
  name: string;
  className?: string;
  fill?: boolean;
  size?: number;
};

export function Icon({ name, className = "", fill = false, size = 24 }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined select-none leading-none ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        fontSize: size,
      }}
    >
      {name}
    </span>
  );
}
