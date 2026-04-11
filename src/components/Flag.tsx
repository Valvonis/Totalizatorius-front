import FlagIcon from "react-flagkit";
import { getCountryCode } from "../utils/countries";

interface FlagProps {
  countryName: string;
  size?: number;
}

export default function Flag({ countryName, size = 48 }: FlagProps) {
  const code = getCountryCode(countryName);
  if (!code) return <span className="text-sm">{countryName}</span>;
  return <FlagIcon country={code} size={size} />;
}
