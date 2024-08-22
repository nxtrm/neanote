import React from 'react'
import CheckBox from '../../../../components/CheckBox/CheckBox';
import { Label } from '../../../../components/@/ui/label';
import { Input } from '../../../../components/@/ui/input';
import { Textarea } from '../../../../components/@/ui/textarea';
import { useHabits } from '../useHabits';
import TagsDropdownMenu from '../../Tags/components/TagsDropdownMenu';
import AutoResizeTextBox from '../../../../components/AutoResizeTextBox/AutoResizeTextBox';
import { Habit } from '../../../api/types/habitTypes';

function Inputs({withChechbox}:{withChechbox?: boolean}) {
  const {currentHabit, updateCurrentHabit, validationErrors, toggleCompletedToday, setPendingChanges} = useHabits();
  return (
    <div>
        <div className='flex flex-row items-center justify-between pt-3 gap-2'>
            {withChechbox && <div className='w-10'>
            <CheckBox checked={currentHabit.completed_today} disabled={currentHabit.completed_today} onChange={()=>toggleCompletedToday(currentHabit.habitid)} />
            </div>}
            <Input
                id="title"
                name="Title*"
                required
                className='border rounded-md w-full h-10 leading-tight focus:outline-none focus:shadow-outline'
                placeholder='Title'
                type='text'
                value={currentHabit?.title || ''}
                onChange={(e) => updateCurrentHabit('title', e.target.value)}
                />
            <TagsDropdownMenu onChange={()=>setPendingChanges(true)}/>
        </div>
        {validationErrors['title'] && (
            <Label htmlFor="title" className='text-destructive py-3'>{validationErrors['title']}</Label>
        )}

        <AutoResizeTextBox<Habit>  content={currentHabit?.content || ''} update={updateCurrentHabit} placeholder='Describe your habit here'/>
        {validationErrors['content'] && (
            <Label htmlFor='content' className='text-destructive'>{validationErrors['content']}</Label>
        )}
        {validationErrors['reminder'] && (
        <Label htmlFor='reminder' className='text-destructive'> {validationErrors['reminder']}</Label>
      )}
    </div>

  )
}

export default Inputs