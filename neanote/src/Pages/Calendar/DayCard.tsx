import React from 'react'
import { Card, CardContent, CardHeader } from '../../../components/@/ui/card'
interface Props {
    day: number
    year: number
    month: number
    handleDateClick: (date: Date) => void
    secondary?: boolean

}

function DayCard({ day, year, month, handleDateClick, secondary}: Props) {
  return (
    <Card
          key={day}
          className={`m-1 items-center justify-center flex flex-col ${secondary ?'bg-secondary' :  'bg-transparent'}`}
          onClick={() => handleDateClick(new Date(year, month, day))}
        >
          <CardHeader>{day}</CardHeader>
          <CardContent>
          </CardContent>
    </Card>
  )
}

export default DayCard