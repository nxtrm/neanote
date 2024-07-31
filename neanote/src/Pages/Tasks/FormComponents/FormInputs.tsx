import React from "react"
import { Input } from "../../../../components/@/ui/input"
import { Textarea } from "../../../../components/@/ui/textarea"
import { Task } from "../../../api/types/taskTypes"
import TagsDropdownMenu from "../../Tags/components/TagsDropdownMenu"
import { useTasks } from "../useTasks"
import CheckBox from "../../../../components/CheckBox/CheckBox"

interface Props {
    content: string
    title: string
    withCheckBox?: boolean
}

function FormInputs({content, title, withCheckBox}: Props) {
    const {updateCurrentTask, setPendingChanges, toggleTaskCompleted, currentTask} = useTasks()
    return (
      <div className="pt-2">            
          <div className="flex flex-row gap-2 ">
            {withCheckBox && <CheckBox checked={currentTask.completed} onChange={()=>toggleTaskCompleted(currentTask.taskid)} />}
              <Input
                  type="text"
                  value={title}
                  placeholder='Title'
                  onChange={(e) => updateCurrentTask('title', e.target.value)}
                  className="w-full p-2 border rounded"
              />
              <TagsDropdownMenu onChange={()=>setPendingChanges(true)}/>
          </div>
          <div className='pt-2 '>
                  <Textarea
                      value={content}
                      placeholder='Describe your task here'
                      onChange={(e) => updateCurrentTask('content', e.target.value)}
                      />
          </div>
      </div>
    )
  }
  
  export default FormInputs