'use client';

import React from 'react';
import { Button } from '@/components';
import { Minus, Plus, RotateCcw } from 'lucide-react';

interface PaddingControlsProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const PaddingControls: React.FC<PaddingControlsProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 5,
}) => {
  const handleDecrease = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const handleReset = () => {
    onChange(0);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs font-medium text-gray-600">{label}</div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-6 w-6 p-0"
          onClick={handleDecrease}
          disabled={value <= min}
          title={`Decrease ${label}`}
        >
          <Minus size={12} />
        </Button>

        <div className="min-w-[40px] text-center font-mono text-xs">{value}px</div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-6 w-6 p-0"
          onClick={handleIncrease}
          disabled={value >= max}
          title={`Increase ${label}`}
        >
          <Plus size={12} />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ml-1 h-6 w-6 p-0"
          onClick={handleReset}
          disabled={value === 0}
          title="Reset to default"
        >
          <RotateCcw size={12} />
        </Button>
      </div>
    </div>
  );
};
