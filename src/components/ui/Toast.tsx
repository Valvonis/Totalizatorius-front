import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface ToastMessage {
  id: number;
  text: string;
  type: "error" | "success";
}

let toastId = 0;
let addToastFn: ((msg: Omit<ToastMessage, "id">) => void) | null = null;

export function showToast(text: string, type: "error" | "success" = "error") {
  addToastFn?.({ text, type });
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToastFn = (msg) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { ...msg, id }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    };
    return () => {
      addToastFn = null;
    };
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-slide-in-right ${
            t.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          <span>{t.text}</span>
          <button onClick={() => dismiss(t.id)} className="ml-2 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
