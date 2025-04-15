import React from 'react'
import { Card, CardContent, CardHeader } from '../../../components/@/ui/card'
import { UniversalType } from '../../api/types/ArchiveTypes'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/@/ui/button'
import { FaEdit } from 'react-icons/fa'
interface Props {
    day: number
    year: number
    month: number
    handleDateClick: (date: Date) => void
    secondary?: boolean
    notes: any[]

}

function DayCard({ day, year, month, handleDateClick, secondary, notes}: Props) {
  function handleEditClick(noteId, type) {
    localStorage.setItem(`current${type.charAt(0).toUpperCase() + type.slice(1)}Id`, noteId.toString());
    navigate(`/${type + 's'}/edit`);
    }
  const navigate = useNavigate();

  return (
    <Card
          key={day}
          className={`m-1 items-center flex flex-col ${secondary ?'bg-secondary' :  'bg-transparent'}`}
          onClick={() => handleDateClick(new Date(year, month, day))}
        >
          <CardHeader>{day}</CardHeader>
          <CardContent>
          {notes?.map(note => (
            <div key={note.noteid} className={`border flex flex-row overflow-clip justify-between items-center p-2 gap-1 rounded-xl border-l-[5px]`}>
              <p className={'max-w-20'}>{note.title}</p>
              <Button onClick={() => handleEditClick(note.noteid, note.type)} size="icon">
                  <FaEdit />
              </Button>
            </div>
          ))}
          </CardContent>
    </Card>
  )
}

export default DayCard