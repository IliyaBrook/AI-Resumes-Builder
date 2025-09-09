'use client';

import React from 'react';
import { Button } from '@/components';
import { Minus, Plus, RotateCcw } from 'lucide-react';

interface PaddingControlsProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
}

export const PaddingControls: React.FC<PaddingControlsProps> = ({ label, value, onChange, min = 0, step = 5 }) => {
  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = value + step;
    onChange(newValue);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange(0);
      return;
    }
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= min) {
      onChange(numValue);
    }
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

        <div className="flex items-center">
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            onClick={e => e.stopPropagation()}
            className="h-6 w-[35px] rounded border border-gray-300 px-1 text-center font-mono text-xs [appearance:textfield] focus:border-blue-500 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            min={min}
            title={`Enter ${label} value`}
          />
          <span className="ml-1 text-xs text-gray-500">px</span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-6 w-6 p-0"
          onClick={handleIncrease}
          disabled={false}
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
