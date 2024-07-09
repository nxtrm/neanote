import React, { useState } from 'react'
import {Label} from '../@/ui/label'
import { Button } from '../@/ui/button'
interface Props {
  name:string
  color:string
  compressed:boolean
}

function TagLabel({name,color,compressed}: Props) {
   const [compressed_, setCompressed] = useState<boolean>(compressed)
   return (
    <Button
      style={{ backgroundColor: color }}
      onClick={() => setCompressed(!compressed_)}
      className={`rounded-${compressed_ ? 'sm' : 'md'} font-bold items-center h-6 text-xs p-1`}
    >
      {!compressed_ && name}
    </Button>
  );}

export default TagLabel