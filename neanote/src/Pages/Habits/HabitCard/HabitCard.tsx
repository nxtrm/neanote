import React from 'react'
import { FaEdit } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../../components/@/ui/button'
import { Skeleton } from '../../../../components/@/ui/skeleton'
import CheckBox from '../../../../components/CheckBox/CheckBox'
import TagLabel from '../../../../components/TagLabel/TagLabel'
import { HabitPreview } from '../../../api/types/habitTypes'
import { useScreenSize } from '../../../DisplayContext'
import { useHabits } from '../useHabits'
import './HabitCard.css'
import StreakLabel from './StreakLabel'

function HabitCard({habit}: {habit: HabitPreview}) {
    const {fetchHabit,loading, toggleCompletedToday} = useHabits();
    const navigate = useNavigate()
    const {isTagCompressed} = useScreenSize()

    function handleEditClick(noteId) {
        localStorage.setItem('currentHabitId', noteId.toString());
        navigate('/habits/edit');
    }

    function handleSetCompleted() {
      toggleCompletedToday(habit.habitid);
    }

  if (loading) {
    return <Skeleton className="p-3 w-full h-[100px] rounded-xl"/>
  }

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
            ()=>handleEditClick(habit.noteid)
          }><FaEdit/></Button>
        </div>
      </div>
      {habit.content && <p className="habit-content">{habit.content}</p>}
  </div>
  )
}

export default HabitCard