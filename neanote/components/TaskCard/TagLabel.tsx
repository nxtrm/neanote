import React from 'react'
import { Tag } from '../../src/api/types/tagTypes'
import {Label} from '../@/ui/label'
interface Props {
  name:string
  color:string
  compressed:boolean
}

function TagLabel({name,color,compressed}: Props) {
   return (
    !compressed ? (<Label style={{backgroundColor: color}} className='rounded-md font-bold items-center text-xs p-1'>{name}</Label>
    ): (<div></div>)
  )
}

export default TagLabel