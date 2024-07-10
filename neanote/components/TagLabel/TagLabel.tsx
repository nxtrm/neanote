import React, { useState } from 'react'
import {Popover, PopoverTrigger, PopoverContent} from '../@/ui/popover'
import { Button } from '../@/ui/button'
interface Props {
  name:string
  color:string
  compressed:boolean
}

function TagLabel({name,color,compressed}: Props) {
   const [compressed_, setCompressed] = useState<boolean>(compressed)
   return (
    <Popover>
        <PopoverTrigger asChild>
          <Button
            style={{ backgroundColor: color }}            
            className={`rounded-${compressed_ ? 'sm' : 'md'} font-bold overflow-clip max-w-20 items-center h-6 text-xs p-1`}
          >
            
          </Button>
        </PopoverTrigger>
      <PopoverContent className='w-21'>
      {name}
      </PopoverContent>
    </Popover>
  );}

export default TagLabel