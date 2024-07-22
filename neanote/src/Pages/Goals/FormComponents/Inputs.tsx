import React from 'react'
import { Input } from '../../../../components/@/ui/input'
import { Goal } from '../../../api/types/goalTypes'
import { Textarea } from '../../../../components/@/ui/textarea'
import TagsDropdownMenu from '../../Tags/components/TagsDropdownMenu'
import { useGoals } from '../useGoals'


function FormInputs({content, title}: Partial<Goal>) {
  const {updateCurrentGoal} = useGoals()
  return (
    <div>            
        <div className="flex flex-row gap-2 ">
            <Input
                type="text"
                value={title}
                placeholder='Title'
                onChange={(e) => updateCurrentGoal('title', e.target.value)}
                className="w-full p-2 border rounded"
            />
            <TagsDropdownMenu/>
        </div>
        <div className='pt-2 pb-3'>
                <Textarea
                    value={content}
                    placeholder='Describe your task here'
                    onChange={(e) => updateCurrentGoal('content', e.target.value)}
                    />
        </div>
    </div>
  )
}

export default FormInputs