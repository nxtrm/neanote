import React, { useEffect, useState } from 'react'
import TitleComponent from '../../../components/TitleComponent/TitleComponent'
import { FaRegCalendar } from 'react-icons/fa'
import {Button} from '../../../components/@/ui/button'
import DayCard from './DayCard';
import { useCalendar } from './useCalendar';
import { useNavigate } from 'react-router-dom';


const Calendar = () => {
  const { currentDate, daysInMonth, handlePrevMonth, handleNextMonth, handleDateClick, fetchNotes, notes } = useCalendar();

  useEffect(() => {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    fetchNotes(startDate, endDate);
    console.log(notes)
  }, [currentDate, fetchNotes]);


  const renderDays = (): JSX.Element[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInCurrentMonth = daysInMonth(month, year);
    const daysInPrevMonth = daysInMonth(month - 1, year);
    const totalDays = 35;
    const daysNeededFromPrevMonth = totalDays - daysInCurrentMonth;

    const days: JSX.Element[] = [];

    // Helper function to get notes for a specific day
    const getNotesForDay = (day: number, month: number, year: number) => {
      return notes.filter(note => {
        const noteDate = new Date(note.due_date);
        return noteDate.getDate() === day && noteDate.getMonth() === month && noteDate.getFullYear() === year;
      });
    };

    // Days from previous month
    for (let i = daysNeededFromPrevMonth; i > 0; i--) {
      const day = daysInPrevMonth - i + 1;
      const dayNotes = getNotesForDay(day, month - 1, year);
      days.push(
        <DayCard
          key={`prev-${day}`}
          day={day}
          year={year}
          month={month - 1}
          handleDateClick={handleDateClick}
          notes={dayNotes}
          secondary
        />
      );
    }

    // Days in current month
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dayNotes = getNotesForDay(day, month, year);
      days.push(
        <DayCard
          key={`current-${day}`}
          day={day}
          year={year}
          month={month}
          handleDateClick={handleDateClick}
          notes={dayNotes}
        />
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
        <div className='flex flex-row gap-2 items-center justify-center'>
          <Button onClick={handlePrevMonth}>Previous</Button>
          <span className='flex bg-primary h-10 rounded-md p-2 text-sm text-secondary items-center justify-center'>
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