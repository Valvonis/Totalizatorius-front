import * as Slider from "@radix-ui/react-slider";

interface GoalSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export default function GoalSlider({ label, value, onChange }: GoalSliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm text-gray-700">
        <span>{label}</span>
        <span className="font-bold text-lg">{value}</span>
      </div>
      <Slider.Root
        className="relative flex items-center w-full h-5 select-none touch-none"
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={10}
        step={1}
      >
        <Slider.Track className="relative grow h-2 rounded-full bg-gray-200">
          <Slider.Range className="absolute h-full rounded-full bg-[var(--color-primary)]" />
        </Slider.Track>
        <Slider.Thumb className="block w-5 h-5 rounded-full bg-white border-2 border-[var(--color-primary)] shadow-md hover:bg-gray-50 focus:outline-none cursor-pointer" />
      </Slider.Root>
    </div>
  );
}
