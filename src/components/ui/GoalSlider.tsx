import * as Slider from "@radix-ui/react-slider";

interface GoalSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export default function GoalSlider({ label, value, onChange }: GoalSliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className="font-bold text-2xl text-gray-900 tabular-nums w-8 text-right">{value}</span>
      </div>
      <Slider.Root
        className="relative flex items-center w-full h-6 select-none touch-none"
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={10}
        step={1}
      >
        <Slider.Track className="relative grow h-2.5 rounded-full bg-gray-200">
          <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] transition-all" />
        </Slider.Track>
        <Slider.Thumb className="block w-6 h-6 rounded-full bg-white border-2 border-[var(--color-primary)] shadow-md hover:shadow-lg hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all cursor-grab active:cursor-grabbing active:scale-105" />
      </Slider.Root>
    </div>
  );
}
