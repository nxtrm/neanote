import React from 'react'
import { UniversalType } from '../../../api/types/ArchiveTypes'
import { FaTasks } from 'react-icons/fa'
import { MdRepeat } from 'react-icons/md'
import { LuGoal } from 'react-icons/lu'
import { Button } from '../../../../components/@/ui/button'
import { MdOutlineRestore } from "react-icons/md";
import { FaRegNoteSticky, FaTrash } from 'react-icons/fa6'
import DeleteDialog from '../../../../components/DeleteDialog/DeleteDialog'
import { useArchive } from '../useArchive'
import TagLabel from '../../../../components/TagLabel/TagLabel'


function ArchiveCard({note}:{note:UniversalType}) {
  const {handleDelete, handleRestore} = useArchive(); 

  const onDelete = async () => {
    await handleDelete(note.type, note.noteid, note.secondaryid);
  }
  const onRestore = async () => {
    await handleRestore(note.noteid);
  }

  return (
    <div className='p-3 w-full rounded-xl border-[2px]'>
        <div className='flex flex-row justify-between '>
            <div className='flex flex-row items-center gap-2' >
                {note.type === 'note' && <FaRegNoteSticky size={'20px'} />}
                {note.type ==='task'&& <FaTasks size={'20px'}/>}
                {note.type ==='habit'&& <MdRepeat size={'20px'}/>}
                {note.type ==='goal'&& <LuGoal size={'22px'}/>}

                <h3 className="task-title">{note.title}</h3>
            </div>
            <div className='flex flex-row items-center gap-2' >
              {note.tags.map((tag, index) => (
                <TagLabel key={index} name={tag.name} color={tag.color} compressed={true}/>
              ))}
                <DeleteDialog handleDelete={onDelete}>
                    <Button size="icon" variant="destructive">
                        <FaTrash />
                    </Button>
                </DeleteDialog>

                <Button onClick={onRestore} size="icon">
                    <MdOutlineRestore size={'20px'}/>
                </Button>
            </div>
        </div>
        {note.content && <p className="text-md pl-1 pt-2">{note.content}</p>}
      </div>
  )
}

export default ArchiveCard