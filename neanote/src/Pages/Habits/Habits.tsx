import React, { useEffect, useState } from 'react'
import PageContainer from '../../../components/PageContainer/PageContainer'
import { Button } from '../../../components/@/ui/button'
import { FaPlus } from 'react-icons/fa6'
import { useHabits } from './useHabits';
import { useNavigate } from 'react-router-dom';
import HabitCard from './HabitCard/HabitCard';

function Habits() {
    const {habits, setCurrentHabit, setSection, fetchHabits} = useHabits();  
    const navigate = useNavigate(); //plan out habits and steps in miro
    const handleAddHabitClick = () => {
        setCurrentHabit({
          habitid: -1,
          noteid: -1,
          title: '',
          tags: [],
          content: '',
          reminder: {reminder_time: '', repetition: 'daily'},
          completed: false,
          streak: 0
        });
        setSection('create');
        navigate('/habits/create')
      };

    
    const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

    useEffect(() => {
        const fetchIfNeeded = () => {
          // Check if never fetched or if 5 minutes have passed since the last fetch
          if (!lastFetchTime || new Date().getTime() - lastFetchTime.getTime() > 300000) {
            fetchHabits();
            setLastFetchTime(new Date());
          }
        };
    
        fetchIfNeeded();
    
        // Set up a timer to refetch every 5 minutes
        const intervalId = setInterval(fetchIfNeeded, 300000);
    
      // Clean up the interval on component unmount
      return () => clearInterval(intervalId);
    }, [fetchHabits, lastFetchTime]);
    

  return (
    <PageContainer>      
    <div className='px-1 py-1'>

        <div className='flex flex-row justify-between pb-2'>
            <p className='pl-1 text-2xl font-bold'>Habits</p>
            <Button size='sm' className='gap-2' onClick={handleAddHabitClick}>
              <FaPlus />  
               Add Habit
            </Button>
          </div>
          <div className='flex flex-col gap-3'>
            {habits.map((habit)=> (<div key={habit.habitid}>
              <HabitCard habit={habit}/>
            </div>))}
          </div>
    </div></PageContainer>
  )
}

export default Habits