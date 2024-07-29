import React from 'react'
import CheckBox from '../../../../components/CheckBox/CheckBox';
import { Label } from '../../../../components/@/ui/label';
import { Input } from '../../../../components/@/ui/input';
import { Textarea } from '../../../../components/@/ui/textarea';
import { useHabits } from '../useHabits';
import TagsDropdownMenu from '../../Tags/components/TagsDropdownMenu';

function Inputs({withChechbox}:{withChechbox?: boolean}) {
  const {currentHabit, updateCurrentHabit, validationErrors, toggleCompletedToday, setPendingChanges} = useHabits();
  return (
    <div>
        <div className='flex flex-row items-center justify-between pt-3 gap-2'>
            {withChechbox && <div className='w-10'>
            <CheckBox checked={currentHabit.completed_today} disabled={currentHabit.completed_today} onChange={()=>toggleCompletedToday(currentHabit.habitid)} />
            </div>}
            <Input
                className='border rounded-md w-full h-10 leading-tight focus:outline-none focus:shadow-outline'
                placeholder='Title'
                type='text'
                value={currentHabit?.title || ''}
                onChange={(e) => updateCurrentHabit('title', e.target.value)}
                />
            <TagsDropdownMenu onChange={()=>setPendingChanges(true)}/>
        </div>
        {validationErrors['title'] && (
            <Label className='text-destructive py-3'>{validationErrors['title']}</Label>
        )}

          <Textarea
            className='pt-3'
            value={currentHabit?.content || ''}
            placeholder='Describe your habit here'
            onChange={(e) => updateCurrentHabit('content', e.target.value)}
            />
        {validationErrors['content'] && (
            <Label className='text-destructive'>{validationErrors['content']}</Label>
        )}
    </div>

  )
}

export default Inputs