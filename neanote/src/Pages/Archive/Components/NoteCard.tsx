import React from 'react'
import { ArchiveType } from '../../../api/types/archiveTypes'
import { FaTasks } from 'react-icons/fa'
import { MdRepeat } from 'react-icons/md'
import { LuGoal } from 'react-icons/lu'
import { Button } from '../../../../components/@/ui/button'
import { MdOutlineRestore } from "react-icons/md";
import { FaTrash } from 'react-icons/fa6'
import DeleteDialog from '../../../../components/DeleteDialog/DeleteDialog'
import { useArchive } from '../useArchive'


function NoteCard({note}:{note:ArchiveType}) {
    const {handleDelete, handleRestore} = useArchive();
  return (
    <div className='p-3 w-full rounded-xl border-[2px]'>
        <div className='flex flex-row justify-between '>
            <div className='flex flex-row items-center gap-2' >
                {note.type ==='task'&& <FaTasks size={'20px'}/>}
                {note.type ==='habit'&& <MdRepeat size={'20px'}/>}
                {note.type ==='goal'&& <LuGoal size={'22px'}/>}

                <h3 className="task-title">{note.title}</h3>                                                       
            </div>
            <div className='flex flex-row items-center gap-2' >
                <DeleteDialog handleDelete={handleDelete}>
                    <Button size="icon" variant="destructive">
                        <FaTrash />
                    </Button>
                </DeleteDialog>
                
                <Button size="icon">
                    <MdOutlineRestore size={'20px'}/>
                </Button>
            </div>
            {/* {note.tags.map((tag, index) => (
              <TagLabel key={index} name={tag.name} color={tag.color} compressed={isTagCompressed}/>
            ))} */}
        </div>
        {note.content && <p className="text-md pl-1 pt-2">{note.content}</p>}
      </div>
  )
}

export default NoteCard