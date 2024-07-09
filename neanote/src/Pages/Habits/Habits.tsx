import React from 'react'
import PageContainer from '../../../components/PageContainer/PageContainer'
import { Button } from '../../../components/@/ui/button'
import { FaPlus } from 'react-icons/fa6'
import { useHabits } from './useHabits';
import { useNavigate } from 'react-router-dom';

function Habits() {
    const {setCurrentHabit, setSection} = useHabits();  
    const navigate = useNavigate(); //plan out habits and steps in miro
    const handleAddHabitClick = () => {
        setCurrentHabit({
            habitid: -1,
            noteid: -1,
            title: '',
            tags: [],
            content: '',
            reminder_time: '',
            completed: false,
            streak: 0
          });
        setSection('create');
        navigate('/habits/create')
      };
    

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
          </div>
    </div></PageContainer>
  )
}

export default Habits