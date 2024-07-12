import React from 'react'
import { Habit } from '../../../api/types/habitTypes'
import CheckBox from '../../../../components/CheckBox/CheckBox'
import{ Button } from '../../../../components/@/ui/button'
import { FaEdit } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useHabits } from '../useHabits'
import './HabitCard.css'

function HabitCard({habit}: {habit: Habit}) {
    const {setCurrentHabit, setSection, setCompleted} = useHabits();
    const navigate = useNavigate()

    function handleEditClick(habit: Habit) {
        setCurrentHabit(habit);
        setSection('edit');
        navigate('/habits/edit');
    }

    function handleSetCompleted() {
        setCompleted(habit.habitid);
    }

  return (
    <div className='p-3 w-full rounded-xl border-[2px]'>
    <div className='flex flex-row items-center gap-3 justify-between'>
      <div className='flex flex-row items-center gap-3'>
        <CheckBox checked={habit.completed_today} disabled={habit.completed_today} onChange={handleSetCompleted} />
        <h3 className='habit-title'>{habit.title}</h3>
      </div>                                                       
      <div className='flex flex-row items-center gap-1'>
        {/* {habit.due_date  && <DateLabel collapsed={isDateCollapsed} date={habit.due_date} />} */}
        {/* {habit.tags.map((tag, index) => (
          <TagLabel key={index} name={tag.name} color={tag.color} compressed={isTagCompressed}/>
        ))} */}
        <Button variant="ghost" size={"icon"} onClick={()=>handleEditClick(habit)}><FaEdit/></Button>
      </div>
    </div>
    {habit.content && <p className="text-md pl-1 pt-2">{habit.content}</p>}

  </div>
  )
}

export default HabitCard