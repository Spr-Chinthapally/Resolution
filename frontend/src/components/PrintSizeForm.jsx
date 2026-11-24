import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const PrintSizeForm = ({ units, width, height, unit, onChange, errors = {} }) => (
  <div data-testid="print-size-form">
    <h4 className="font-heading text-lg font-semibold text-slate-900">Final Print Size</h4>
    <p className="mt-1 text-sm text-slate-500">Enter the physical size you want to print at.</p>

    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label className="text-xs font-mono uppercase tracking-widest text-slate-500">Width</label>
        <Input
          type="number"
          min="0"
          step="any"
          value={width}
          onChange={(e) => onChange({ printWidth: e.target.value })}
          placeholder="e.g. 20"
          className={`mt-1.5 rounded-lg ${errors.width ? "border-red-400 focus-visible:ring-red-400" : "border-slate-300"}`}
          data-testid="print-width-input"
        />
      </div>
      <div>
        <label className="text-xs font-mono uppercase tracking-widest text-slate-500">Height</label>
        <Input
          type="number"
          min="0"
          step="any"
          value={height}
          onChange={(e) => onChange({ printHeight: e.target.value })}
          placeholder="e.g. 10"
          className={`mt-1.5 rounded-lg ${errors.height ? "border-red-400 focus-visible:ring-red-400" : "border-slate-300"}`}
          data-testid="print-height-input"
        />
      </div>
      <div>
        <label className="text-xs font-mono uppercase tracking-widest text-slate-500">Unit</label>
        <Select value={unit} onValueChange={(v) => onChange({ printUnit: v })}>
          <SelectTrigger className="mt-1.5 rounded-lg border-slate-300 bg-white" data-testid="print-unit-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {units.map((u) => (
              <SelectItem key={u.value} value={u.value} data-testid={`unit-${u.value}`}>
                {u.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    {(errors.width || errors.height) && (
      <p className="mt-3 text-sm font-medium text-red-600" data-testid="print-size-error">
        {errors.width || errors.height}
      </p>
    )}
  </div>
);
