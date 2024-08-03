import React from 'react'
import { ArchiveType } from '../../../api/types/archiveTypes'

function NoteCard({note}:{note:ArchiveType}) {
  return (
    <div className='p-3 w-full rounded-xl border-[2px]'>
        <div className='flex flex-row items-center gap-3 justify-between'>
            <h3 className="task-title">{note.title}</h3>                                                       
            {/* {note.tags.map((tag, index) => (
              <TagLabel key={index} name={tag.name} color={tag.color} compressed={isTagCompressed}/>
            ))} */}
        </div>
        {note.content && <p className="text-md pl-1 pt-2">{note.content}</p>}
      </div>
  )
}

export default NoteCard