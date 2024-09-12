import React from 'react'

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "../@/ui/dropdown-menu"
import { Button } from '../@/ui/button'

interface Props {
  order:string
  setOrder: (order: string)=>void;
}

function SortMenu({order, setOrder} : Props) {
  return (
    <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button className='w-[120px]' variant="default">Sort: {order.charAt(0).toUpperCase() + order.slice(1)}</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-[120px] flex flex-col justify-center items-center">
      <DropdownMenuLabel onClick={()=>setOrder('ascending')}>Ascending</DropdownMenuLabel>
      <DropdownMenuLabel onClick={()=> setOrder('descending')}>Descending</DropdownMenuLabel>
    </DropdownMenuContent>
  </DropdownMenu>
  )
}

export default SortMenu