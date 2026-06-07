import type { InputHTMLAttributes } from "react";

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  compact?: boolean;
}

export default function FormInput({ label, compact = false, className = "", ...props }: FormInputProps) {
  const classes = [
    compact ? "px-3 py-1.5" : "px-3 py-2",
    "border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
    label ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const input = <input className={classes} {...props} />;

  if (!label) return input;

  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {input}
    </div>
  );
}
