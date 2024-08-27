import React from "react"
import { Input } from "../../../../components/@/ui/input"
import { Label } from "../../../../components/@/ui/label"
import AutoResizeTextBox from "../../../../components/AutoResizeTextBox/AutoResizeTextBox"
import CheckBox from "../../../../components/CheckBox/CheckBox"
import { Note } from "../../../api/types/noteTypes"
import TagsDropdownMenu from "../../Tags/components/TagsDropdownMenu"
import { useNotes } from "../useNotes"

interface Props {
    content: string
    title: string
    validationErrors: { [key: string]: string | undefined}
}

function FormInputs({content, title, validationErrors}: Props) {
    const {updateCurrentNote, setPendingChanges} = useNotes()

    return (
      <div className="pt-2 h-full">
        <div className="flex flex-row gap-2 ">
          <Input
            id="title"
            name="Title*"
            required
            type="text"
            value={title}
            placeholder='Title'
            onChange={(e) => updateCurrentNote('title', e.target.value)}
            className="w-full p-2 border rounded"
          />
          <TagsDropdownMenu onChange={()=>setPendingChanges(true)}/>
        </div>
        {validationErrors['title'] && (
        <Label htmlFor="title" className='text-destructive'>{validationErrors['title']}</Label>
        )}

        <AutoResizeTextBox<Note>  content={content} update={updateCurrentNote} placeholder='Describe your note here'/>

        {validationErrors['content'] && (
        <Label htmlFor="content" className='text-destructive'>{validationErrors['content']}</Label>
        )}
      </div>
    )
  }

  export default FormInputs