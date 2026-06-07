import type { SelectHTMLAttributes } from "react";

interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  compact?: boolean;
}

export default function FormSelect({ label, compact = false, className = "", children, ...props }: FormSelectProps) {
  const classes = [
    compact ? "px-3 py-1.5" : "px-3 py-2",
    "border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
    label ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const select = (
    <select className={classes} {...props}>
      {children}
    </select>
  );

  if (!label) return select;

  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {select}
    </div>
  );
}
