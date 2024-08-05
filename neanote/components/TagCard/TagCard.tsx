import React from 'react'
import { Tag } from '../../src/api/types/tagTypes'
import { Button } from '../@/ui/button'
import { FaEdit } from 'react-icons/fa'
import { useTags } from '../../src/Pages/Tags/useTags'

function TagCard({tag}:{tag:Tag}) {
  const { setCurrentTagId, setTagTitle, setColor, setSection } = useTags()
  function handleEditTag(tagId) {
    setCurrentTagId(tagId)
    setTagTitle(tag.name)
    setColor(tag.color)
    setSection('edit')
  }

  return (
    <div className=' rounded-xl border-[2px]'>
        <div className='p-2 flex items-center gap-2 flex-row justify-between'>
            <div style={{ backgroundColor: tag.color, width: '15px', height: '15px', borderRadius: '50%', marginLeft:5 }}></div>
            <p className='pl-1 text-2xl font-bold'>{tag.name}</p>
            <Button variant="ghost" size={"icon"} onClick={
                () => {
                    handleEditTag(tag.tagid)
                }
            
            }><FaEdit/></Button>
        </div>
    </div>
  )
}

export default TagCard