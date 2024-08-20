import React from 'react'
import { UniversalType } from '../../src/api/types/ArchiveTypes'
import { FaTasks, FaEdit } from 'react-icons/fa'
import { LuGoal } from 'react-icons/lu'
import { MdRepeat } from 'react-icons/md'
import { Button } from '../@/ui/button'
import TagLabel from '../TagLabel/TagLabel'
import { UUID } from 'crypto'

function UniversalCard({note, handleEditClick}: {note: UniversalType, handleEditClick: (noteId: UUID, type: string) => void}) {
  return (
    <div className='p-3 w-full bg-background rounded-xl border-[2px]'>
            <div className='flex flex-row justify-between '>
                <div className='flex flex-row items-center gap-2'>
                    {note.type === 'task' && <FaTasks size={'20px'} />}
                    {note.type === 'habit' && <MdRepeat size={'20px'} />}
                    {note.type === 'goal' && <LuGoal size={'22px'} />}
                    {/* add other types here */}
                    <h3 className="note-title">{note.title}</h3>
                </div>
                <div className='flex flex-row items-center gap-2'>
                    {note.tags.map((tag, index) => (
                        <TagLabel key={index} name={tag.name} color={tag.color} compressed={true} />
                    ))}
                    <Button variant="ghost" onClick={() => handleEditClick(note.noteid, note.type)} size="icon">
                        <FaEdit />
                    </Button>
                </div>
            </div>
            {note.content && <p className="text-md max-w-[400px] overflow-hidden overflow-ellipsis pl-1 pt-2">{note.content}</p>}
        </div>
  )
}

export default UniversalCard