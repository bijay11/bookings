'use client';

import { useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

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
  variant?: 'plain' | 'bordered';
}

export function DateRangePicker({
  onDatesChange,
  startDate = null,
  endDate = null,
  className = '',
  align = 'left',
  startPlaceholder = 'Add date',
  endPlaceholder = 'Add date',
  minDate,
  maxDate,
  variant = 'plain',
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
    if (onDatesChange) onDatesChange(date, internalEndDate);
    if (date) {
      setActivePicker('end');
      endDateRef.current?.setOpen(true);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setInternalEndDate(date);
    if (onDatesChange) onDatesChange(internalStartDate, date);
  };

  const handleDatePickerOpen = (picker: 'start' | 'end') => {
    setActivePicker(picker);
    if (picker === 'start') {
      startDateRef.current?.setOpen(true);
      endDateRef.current?.setOpen(false);
    } else {
      endDateRef.current?.setOpen(true);
      startDateRef.current?.setOpen(false);
    }
  };

  const alignmentClasses = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center',
  };

  const variantStyles = {
    plain: {
      container: 'gap-4',
      innerWrapper: 'flex flex-col md:flex-row w-full',
      dateContainer: 'w-full md:w-1/2 p-0',
      dateInput: '',
      activeInput: '',
    },
    bordered: {
      container:
        'border border-gray-300 rounded-lg bg-white overflow-hidden w-full',
      innerWrapper:
        'flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-300 w-full',
      dateContainer: 'flex-1 min-w-0 p-4',
      dateInput: 'border-none bg-transparent',
      activeInput: 'bg-gray-50',
    },
  };

  return (
    <div className={`${variantStyles[variant].container} ${className}`}>
      <div className={`${variantStyles[variant].innerWrapper}`}>
        {/* Start Date */}
        <div
          className={`${variantStyles[variant].dateContainer} ${
            activePicker === 'start' ? variantStyles[variant].activeInput : ''
          }`}
        >
          <div className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1">
            <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
            <span>CHECK-IN</span>
          </div>
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
            className={`w-full cursor-pointer text-sm ${variantStyles[variant].dateInput}`}
            calendarClassName={`${alignmentClasses[align]}`}
            popperPlacement="bottom-start"
            customInput={
              <div
                onClick={() => handleDatePickerOpen('start')}
                className="text-sm text-gray-700 cursor-pointer"
              >
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

        {/* End Date */}
        <div
          className={`${variantStyles[variant].dateContainer} ${
            activePicker === 'end' ? variantStyles[variant].activeInput : ''
          }`}
        >
          <div className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1">
            <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
            <span>CHECK-OUT</span>
          </div>
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
            className={`w-full cursor-pointer text-sm ${variantStyles[variant].dateInput}`}
            calendarClassName={`${alignmentClasses[align]}`}
            popperPlacement="bottom-start"
            customInput={
              <div
                onClick={() => handleDatePickerOpen('end')}
                className="text-sm text-gray-700 cursor-pointer"
              >
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
    </div>
  );
}
