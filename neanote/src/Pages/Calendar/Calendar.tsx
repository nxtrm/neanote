import React, { useState } from 'react'
import TitleComponent from '../../../components/TitleComponent/TitleComponent'
import { FaRegCalendar } from 'react-icons/fa'
import {Button} from '../../../components/@/ui/button'
import DayCard from './DayCard';


const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    console.log(`Date picked: ${date.toDateString()}`);
  };

  const renderDays = (): JSX.Element[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInCurrentMonth = daysInMonth(month, year);
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInPrevMonth = daysInMonth(month - 1, year);
    const totalDays = 35;
    const daysNeededFromPrevMonth = totalDays - daysInCurrentMonth;


    const days: JSX.Element[] = [];

    // Days from previous month
    for (let i = daysNeededFromPrevMonth; i > 0; i--) {
      const day = daysInPrevMonth - i + 1;
      days.push(
        <DayCard
          key={`prev-${day}`}
          day={day}
          year={year}
          month={month - 1}
          handleDateClick={handleDateClick}
          secondary
        />
      );
    }

    // Days in current month
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      days.push(
        <DayCard day={day} year={year} month={month} handleDateClick={handleDateClick}/>
      );
    }

    return days;
  };

  return (
    <>
      <div className='flex flex-row gap-2 mb-2 items-center justify-between'>
        <TitleComponent>
          <FaRegCalendar size={'18px'} /> Calendar
        </TitleComponent>
        <div className='flex flex-row gap-2 items-center'>
          <Button onClick={handlePrevMonth}>Previous</Button>
          <span className='flex bg-primary h-10 rounded-md p-2 text-sm text-secondary items-center '>
            {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
          </span>
          <Button onClick={handleNextMonth}>Next</Button>
        </div>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5">
        {renderDays()}
      </div>
    </>
  );
};

export default Calendar;