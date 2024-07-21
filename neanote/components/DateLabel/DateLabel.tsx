import React from 'react'
import { FaBell } from 'react-icons/fa';

interface Props {
  date: Date | undefined
  collapsed?: boolean
  includeTime?: boolean
}   

function DateLabel({date, collapsed, includeTime}: Props) {

  function formatDate(dateInput: Date | undefined, includeTime: boolean = false): string {
    if (!dateInput) return 'No due date';
    let date: Date;
    if (typeof dateInput === 'string') {
        date = new Date(dateInput);
        if (isNaN(date.getTime())) { // Check if date is invalid
            return 'Invalid date';
        }
    } else if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
        date = dateInput;
    } else {
        return 'Invalid date';
    }
    const options: Intl.DateTimeFormatOptions = includeTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' };
    return new Intl.DateTimeFormat('en-US', { ...options, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }).format(date);
  }

    const isOverdue = (dateString: string | undefined) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        return date < new Date();
    };

  return (
    <div className={`text-xs items-center flex flex-row h-6 gap-1 p-1 rounded-md ${isOverdue(formatDate(date, includeTime)) ? 'bg-red-400' : 'bg-secondary'}`}>
                <FaBell /> {!collapsed && formatDate(date, includeTime)}
    </div>
  )
}

export default DateLabel