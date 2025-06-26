// components/DateRangePicker.tsx
'use client';

import { useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangePickerProps {
  onDatesChange?: (startDate: Date | null, endDate: Date | null) => void;
  startDate?: Date | null;
  endDate?: Date | null;
  className?: string;
  align?: 'left' | 'right' | 'center';
  startPlaceholder?: string;
  endPlaceholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

export default function DateRangePicker({
  onDatesChange,
  startDate = null,
  endDate = null,
  className = '',
  align = 'left',
  startPlaceholder = 'Add date',
  endPlaceholder = 'Add date',
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const [internalStartDate, setInternalStartDate] = useState<Date | null>(
    startDate
  );
  const [internalEndDate, setInternalEndDate] = useState<Date | null>(endDate);
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(
    null
  );
  const startDateRef = useRef<DatePicker>(null);
  const endDateRef = useRef<DatePicker>(null);

  const handleStartDateChange = (date: Date | null) => {
    setInternalStartDate(date);
    if (onDatesChange) {
      onDatesChange(date, internalEndDate);
    }
    if (date) {
      setActivePicker('end');
      endDateRef.current?.setOpen(true);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setInternalEndDate(date);
    if (onDatesChange) {
      onDatesChange(internalStartDate, date);
    }
  };

  const handleDatePickerOpen = (picker: 'start' | 'end') => {
    if (picker === 'start') {
      setActivePicker('start');
      startDateRef.current?.setOpen(true);
      endDateRef.current?.setOpen(false);
    } else {
      setActivePicker('end');
      endDateRef.current?.setOpen(true);
      startDateRef.current?.setOpen(false);
    }
  };

  const alignmentClasses = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center',
  };

  return (
    <div className={`flex flex-col md:flex-row gap-4 ${className}`}>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-700 mb-1">Check-in</div>
        <DatePicker
          ref={startDateRef}
          selected={internalStartDate}
          onChange={handleStartDateChange}
          onCalendarOpen={() => setActivePicker('start')}
          onCalendarClose={() => setActivePicker(null)}
          selectsStart
          startDate={internalStartDate}
          endDate={internalEndDate}
          minDate={minDate ?? new Date()}
          maxDate={maxDate}
          placeholderText={startPlaceholder}
          className={`w-full py-2 cursor-pointer text-sm ${
            activePicker === 'start' ? 'border-rose-500' : 'border-gray-300'
          }`}
          calendarClassName={`${alignmentClasses[align]}`}
          popperPlacement="bottom-start"
          customInput={
            <div onClick={() => handleDatePickerOpen('start')}>
              {internalStartDate
                ? internalStartDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : startPlaceholder}
            </div>
          }
        />
      </div>

      <div className="flex-1">
        <div className="text-sm font-medium text-gray-700 mb-1">Check-out</div>
        <DatePicker
          ref={endDateRef}
          selected={internalEndDate}
          onChange={handleEndDateChange}
          onCalendarOpen={() => setActivePicker('end')}
          onCalendarClose={() => setActivePicker(null)}
          selectsEnd
          startDate={internalStartDate}
          endDate={internalEndDate}
          minDate={internalStartDate || minDate || new Date()}
          maxDate={maxDate}
          placeholderText={endPlaceholder}
          className={`w-full py-2 cursor-pointer text-sm ${
            activePicker === 'end' ? 'border-rose-500' : 'border-gray-300'
          }`}
          calendarClassName={`${alignmentClasses[align]}`}
          popperPlacement="bottom-start"
          customInput={
            <div onClick={() => handleDatePickerOpen('end')}>
              {internalEndDate
                ? internalEndDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : endPlaceholder}
            </div>
          }
        />
      </div>
    </div>
  );
}
