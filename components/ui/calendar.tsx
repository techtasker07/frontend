"use client"

import * as React from "react"

export type CalendarProps = {
  className?: string;
  mode?: string;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
}

function Calendar({
  className = "",
  selected,
  onSelect,
  disabled,
  ...props
}: CalendarProps) {
  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <input 
        type="date" 
        className="w-full p-2 border rounded"
        value={selected ? selected.toISOString().split('T')[0] : ''}
        onChange={(e) => {
          if (onSelect && e.target.value) {
            onSelect(new Date(e.target.value));
          }
        }}
        {...props}
      />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
