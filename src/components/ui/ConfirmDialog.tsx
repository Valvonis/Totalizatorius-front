import { useEffect, useRef, useState } from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";
import Modal from "./Modal";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
}

type Resolver = (confirmed: boolean) => void;

let requestConfirm: ((options: ConfirmOptions) => Promise<boolean>) | null = null;

// eslint-disable-next-line react-refresh/only-export-components -- imperative API lives with its container by design, mirroring showToast
export function showConfirm(options: ConfirmOptions): Promise<boolean> {
  if (requestConfirm) return requestConfirm(options);
  // Fallback if the container isn't mounted — still ask rather than silently proceed/block.
  return Promise.resolve(window.confirm(options.message));
}

export default function ConfirmDialog() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<Resolver | null>(null);

  useEffect(() => {
    requestConfirm = (opts) =>
      new Promise<boolean>((resolve) => {
        resolverRef.current?.(false); // cancel any in-flight request
        resolverRef.current = resolve;
        setOptions(opts);
      });
    return () => {
      requestConfirm = null;
    };
  }, []);

  const settle = (confirmed: boolean) => {
    resolverRef.current?.(confirmed);
    resolverRef.current = null;
    setOptions(null);
  };

  if (!options) return null;

  const danger = options.variant === "danger";

  return (
    <Modal open onClose={() => settle(false)} title={options.title}>
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${danger ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
            {danger ? <AlertTriangle size={18} /> : <HelpCircle size={18} />}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed pt-1.5">{options.message}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => settle(false)}
            className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
          >
            {options.cancelText ?? "Atšaukti"}
          </button>
          <button
            type="button"
            onClick={() => settle(true)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-colors cursor-pointer ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
            }`}
          >
            {options.confirmText ?? "Patvirtinti"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
