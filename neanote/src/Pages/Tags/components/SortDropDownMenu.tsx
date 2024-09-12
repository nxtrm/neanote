import React from 'react'

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "../../../../components/@/ui/dropdown-menu"
import { Button } from '../../../../components/@/ui/button'

interface Props {
  order:string
  setOrder: (order: string)=>void;
}

function SortDropDownMenu({order, setOrder} : Props) {
  return (
    <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button className='w-40' variant="default">Sort: {order.charAt(0).toUpperCase() + order.slice(1)}</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-40 flex flex-col justify-center items-center">
      <DropdownMenuLabel onClick={()=>setOrder('ascending')}>Ascending</DropdownMenuLabel>
      <DropdownMenuLabel onClick={()=> setOrder('descending')}>Descending</DropdownMenuLabel>
    </DropdownMenuContent>
  </DropdownMenu>
  )
}

export default SortDropDownMenu