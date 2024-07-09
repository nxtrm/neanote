import React from 'react'
import { FaBell } from 'react-icons/fa';

interface Props {
  date: string | Date | undefined
}   

function DateLabel({date}:Props) {

    function formatDateWithTime(dateInput: string | Date | undefined): string {
        if (!dateInput) return 'No due date';
        let date: Date;
        if (typeof dateInput === 'string') {
          date = new Date(dateInput);
        } else if (dateInput instanceof Date) {
          date = dateInput;
        } else {
          return 'Invalid date';
        }
        return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }).format(date);
    }

    const isOverdue = (dateString: string | undefined) => {
        if (!dateString) return false;
        // Parse the dateString into a Date object
        const date = new Date(dateString);
        return date < new Date();
      };

  return (
    <div className={`text-xs  items-center flex flex-row gap-1 p-1 rounded-md ${isOverdue(formatDateWithTime(date)) ? 'bg-red-400' : 'bg-secondary'}`}>
             <FaBell /> {formatDateWithTime(date)}
    </div>
  )
}

export default DateLabel