import React, { useEffect, useState } from 'react'
import PageContainer from '../../../components/PageContainer/PageContainer'
import { Button } from '../../../components/@/ui/button'
import { FaPlus } from 'react-icons/fa6'
import { useHabits } from './useHabits';
import { useNavigate } from 'react-router-dom';
import HabitCard from './HabitCard/HabitCard';
import { MdRepeat } from "react-icons/md";
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import PaginationSelector from '../../../components/Pagination/PaginationSelector';

function Habits() {
    const {habitPreviews, resetCurrentHabit, setSection, fetchHabitPreviews, nextPage, page} = useHabits();  
    const navigate = useNavigate(); 
    const handleAddHabitClick = () => {
        resetCurrentHabit();
        setSection('create');
        navigate('/habits/create')
      };

    
    const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

    useEffect(() => {
        const fetchIfNeeded = () => {
          // Check if never fetched or if 5 minutes have passed since the last fetch
          if (!lastFetchTime || new Date().getTime() - lastFetchTime.getTime() > 300000) {
            fetchHabitPreviews(page);
            setLastFetchTime(new Date());
          }
        };
    
        fetchIfNeeded();
    
        // Set up a timer to refetch every 5 minutes
        const intervalId = setInterval(fetchIfNeeded, 300000);
    
      // Clean up the interval on component unmount
      return () => clearInterval(intervalId);
    }, [fetchHabitPreviews, lastFetchTime]);
    

  return (
    <>      
      <div className='flex flex-row justify-between pb-2'>
        <TitleComponent><MdRepeat size={'20px'}/> Habits</TitleComponent>
        <Button size='sm' className='gap-2' onClick={handleAddHabitClick}>
          <FaPlus />  
           Add Habit
        </Button>
      </div>
      <div className='flex flex-col flex-grow gap-3'>
        {habitPreviews.map((habit)=> (<div key={habit.habitid}>
          <HabitCard habit={habit}/>
        </div>))}
      </div>
      <div className="p-1 pt-2">
        <PaginationSelector fetchingFunction={fetchHabitPreviews} nextPage={nextPage} />
      </div>
  </>
  )
}

export default Habits