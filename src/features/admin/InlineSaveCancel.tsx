import { Save, Check, X } from "lucide-react";

interface InlineSaveCancelProps {
  onSave: () => void;
  onCancel: () => void;
  saveDisabled?: boolean;
  icon?: "save" | "check";
  iconSize?: number;
}

// Green save + gray cancel icon-button pair used by inline edit rows.
export default function InlineSaveCancel({ onSave, onCancel, saveDisabled = false, icon = "save", iconSize = 14 }: InlineSaveCancelProps) {
  const SaveIcon = icon === "check" ? Check : Save;
  return (
    <>
      <button
        onClick={onSave}
        disabled={saveDisabled}
        className="p-1.5 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors disabled:opacity-40"
      >
        <SaveIcon size={iconSize} />
      </button>
      <button
        onClick={onCancel}
        className="p-1.5 bg-gray-200 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors"
      >
        <X size={iconSize} />
      </button>
    </>
  );
}
