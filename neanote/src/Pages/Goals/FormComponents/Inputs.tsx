import React from 'react'
import { Input } from '../../../../components/@/ui/input'
import { Goal } from '../../../api/types/goalTypes'
import { Textarea } from '../../../../components/@/ui/textarea'
import TagsDropdownMenu from '../../Tags/components/TagsDropdownMenu'
import { useGoals } from '../useGoals'
import { Label } from '../../../../components/@/ui/label'


function FormInputs({content, title}: Partial<Goal>) {
  const {updateCurrentGoal, validationErrors, setPendingChanges} = useGoals()
  return (
    <div>            
        <div className="flex flex-row gap-2 ">
            <Input
                id="title"
                name="Title*"
                type="text"
                value={title}
                placeholder='Title'
                onChange={(e) => updateCurrentGoal('title', e.target.value)}
                className="w-full p-2 border rounded"
                required
            />
            <TagsDropdownMenu onChange={()=>setPendingChanges(true)}/>
        </div>
        {validationErrors['title'] && (
                  <Label htmlFor='title' className='text-destructive'>{validationErrors['title']}</Label>
                )}

            <Textarea
                id="content"
                name="Content"
                className='my-2 min-h-[10vh]  h-auto max-h-[70vh]'
                value={content}
                placeholder='Describe your goal here'
                onChange={(e) => updateCurrentGoal('content', e.target.value)}
                />
        {validationErrors['content'] && (
          <Label htmlFor="content" className='text-destructive'>{validationErrors['content']}</Label>
        )}
    </div>
  )
}

export default FormInputs