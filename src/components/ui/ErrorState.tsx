import { AlertCircle, RotateCw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = "Nepavyko įkelti duomenų.", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center py-12 animate-fade-up">
      <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center">
        <AlertCircle size={24} className="text-red-400" />
      </div>
      <p className="text-white/70 text-sm max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 text-sm font-medium transition-colors cursor-pointer"
        >
          <RotateCw size={15} />
          Bandyti dar kartą
        </button>
      )}
    </div>
  );
}
