import React from 'react'
import { Tag } from '../../src/api/types/tagTypes'
import { Button } from '../@/ui/button'
import { FaEdit } from 'react-icons/fa'

function TagCard({tag}:{tag:Tag}) {
  return (
    <div className=' rounded-xl border-[2px]'>
        <div className='p-2 flex items-center gap-2 flex-row justify-between'>
            <div style={{ backgroundColor: tag.color, width: '15px', height: '15px', borderRadius: '50%' }}></div>
            <p className='pl-1 text-2xl font-bold'>{tag.name}</p>
            <Button variant="ghost" size={"icon"}><FaEdit/></Button>
        </div>
    </div>
  )
}

export default TagCard