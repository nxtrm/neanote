import React, { useState } from 'react'
import {Popover, PopoverTrigger, PopoverContent} from '../@/ui/popover'
import { Button } from '../@/ui/button'
interface Props {
  name:string
  color:string
  compressed:boolean
}

function TagLabel({name,color,compressed}: Props) {

  return (
    <>
      {compressed ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              style={{ backgroundColor: color }}
              className={`rounded-${compressed ? 'sm' : 'md'} font-bold overflow-clip max-w-20 items-center h-6 text-xs p-1`}
            >
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-21'>
            {name}
          </PopoverContent>
        </Popover>
      ) : (
        <div style={{ backgroundColor: color }} className='text-sm flex font h-6 rounded-md items-center p-2'> 
          {name}
        </div>
      )} 
    </>
  );}

export default TagLabel