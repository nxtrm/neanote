import React from "react"
import { Input } from "../../../../components/@/ui/input"
import { Textarea } from "../../../../components/@/ui/textarea"
import { Task } from "../../../api/types/taskTypes"
import TagsDropdownMenu from "../../Tags/components/TagsDropdownMenu"
import { useTasks } from "../useTasks"
import CheckBox from "../../../../components/CheckBox/CheckBox"
import { Label } from "../../../../components/@/ui/label"

interface Props {
    content: string
    title: string
    validationErrors: { [key: string]: string | undefined}
    withCheckBox?: boolean
}

function FormInputs({content, title, withCheckBox, validationErrors}: Props) {
    const {updateCurrentTask, setPendingChanges, toggleTaskCompleted, currentTask} = useTasks()
    return (
      <div className="pt-2">            
          <div className="flex flex-row gap-2 ">
            {withCheckBox && <CheckBox checked={currentTask.completed} onChange={()=>toggleTaskCompleted(currentTask.taskid)} />}
              <Input
                  id="title"
                  name="Title*"
                  required
                  type="text"
                  value={title}
                  placeholder='Title'
                  onChange={(e) => updateCurrentTask('title', e.target.value)}
                  className="w-full p-2 border rounded"
              />
              <TagsDropdownMenu onChange={()=>setPendingChanges(true)}/>
          </div>          
          {validationErrors['title'] && (
            <Label htmlFor="title" className='text-destructive'>{validationErrors['title']}</Label>
          )}
          <div className='pt-2 '>
                  <Textarea
                      id="content"
                      name="Content"
                      value={content}
                      placeholder='Describe your task here'
                      onChange={(e) => updateCurrentTask('content', e.target.value)}
                      />
          </div>
          {validationErrors['content'] && (
            <Label htmlFor="content" className='text-destructive'>{validationErrors['content']}</Label>
          )}
      </div>
    )
  }
  
  export default FormInputs