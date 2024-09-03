import React from 'react'
import { Card, CardContent, CardHeader } from '../../../components/@/ui/card'
import { UniversalType } from '../../api/types/ArchiveTypes'
interface Props {
    day: number
    year: number
    month: number
    handleDateClick: (date: Date) => void
    secondary?: boolean
    notes: any[]

}

function DayCard({ day, year, month, handleDateClick, secondary, notes}: Props) {
  return (
    <Card
          key={day}
          className={`m-1 items-center justify-center flex flex-col ${secondary ?'bg-secondary' :  'bg-transparent'}`}
          onClick={() => handleDateClick(new Date(year, month, day))}
        >
          <CardHeader>{day}</CardHeader>
          <CardContent>
          {notes?.map(note => (
            <div key={note.note_id} className="">
              {note.title}
            </div>
          ))}
          </CardContent>
    </Card>
  )
}

export default DayCard