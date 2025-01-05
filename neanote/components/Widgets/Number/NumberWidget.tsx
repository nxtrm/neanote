import React from 'react'
interface Props {
    caption : string
    number: number
}
function NumberWidget({caption, number}: Props) {
  return (
    <div className='flex flex-col min-h-[150px] gap-2 items-center justify-center rounded-md shadow-md'>
        <h1 className='text-7xl font-bold'>{number}</h1>
        <h1 className='text-sm'>{caption}</h1>
    </div>
  )
}

export default NumberWidget