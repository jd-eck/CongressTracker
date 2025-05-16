import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ImportanceSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function ImportanceSlider({ value, onChange, className }: ImportanceSliderProps) {
  const getImportanceLabel = (value: number) => {
    switch (value) {
      case 0:
        return "Don't track";
      case 1:
        return "Low";
      case 2:
        return "Medium";
      case 3:
        return "High";
      default:
        return "Medium";
    }
  };

  return (
    <div className={cn("flex items-center space-x-4", className)}>
      <Slider
        value={[value]}
        min={0}
        max={3}
        step={1}
        onValueChange={(values) => onChange(values[0])}
        className="flex-1"
      />
      <span className="text-sm font-medium text-neutral-300 min-w-16">
        {getImportanceLabel(value)}
      </span>
    </div>
  );
}
