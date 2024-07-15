import React, { useEffect, useState } from 'react'
import { Habit, HabitPreview } from '../../../api/types/habitTypes'
import CheckBox from '../../../../components/CheckBox/CheckBox'
import{ Button } from '../../../../components/@/ui/button'
import { FaEdit } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useHabits } from '../useHabits'
import TagLabel from '../../../../components/TagLabel/TagLabel'
import './HabitCard.css'
import StreakLabel from './StreakLabel'

function HabitCard({habit}: {habit: HabitPreview}) {
    const {setCurrentHabit, fetchHabit, setSection, setCompleted} = useHabits();
    const navigate = useNavigate()

    function handleEditClick(habitId, noteId) {
        fetchHabit(habitId, noteId);
        setSection('edit');
        navigate('/habits/edit');
    }

    function handleSetCompleted() {
        setCompleted(habit.habitid);
    }
  
    const [screenSize, setScreenSize] = useState('large'); // Default to large

    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth < 650) {
          setScreenSize('small');
        } else if (window.innerWidth >= 650 && window.innerWidth < 1024) {
          setScreenSize('medium');
        } else {
          setScreenSize('large');
        }
      };
  
      // Set initial size
      handleResize();
  
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    const isTagCompressed = screenSize !== 'large';
  

  return (
    <div className='p-3 w-full rounded-xl border-[2px]'>
    <div className='flex flex-row items-center gap-3 justify-between'>
      <div className='flex flex-row items-center gap-3'>
        <CheckBox checked={habit.completed_today} disabled={habit.completed_today} onChange={handleSetCompleted} />
        <h3 className='habit-title'>{habit.title}</h3>
      </div>                                                       
      <div className='flex flex-row items-center gap-1'>
        <StreakLabel streak={habit.streak} completed_today={habit.completed_today} />
        {habit.tags.map((tag, index) => (
          <TagLabel key={index} name={tag.name} color={tag.color} compressed={isTagCompressed}/>
        ))}
        <Button variant="ghost" size={"icon"} onClick={
          ()=>handleEditClick(habit.habitid, habit.noteid)
          // () => console.log('edit')
        }><FaEdit/></Button>
      </div>
    </div>
    {habit.content && <p className="habit-content">{habit.content}</p>}

  </div>
  )
}

export default HabitCard