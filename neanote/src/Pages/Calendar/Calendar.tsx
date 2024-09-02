import React from 'react'
import TitleComponent from '../../../components/TitleComponent/TitleComponent'
import { FaRegCalendar } from 'react-icons/fa'

function Calendar() {
  return (
    <>
        <TitleComponent>
          <FaRegCalendar  size={'18px'} /> Calendar
        </TitleComponent>
    </>
  )
}

export default Calendar