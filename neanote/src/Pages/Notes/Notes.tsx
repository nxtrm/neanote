import React from 'react'
import { useNotes } from './useNotes'
import PageContainer from '../../../components/PageContainer/PageContainer'



function Notes() {
    let {
        section
    } = useNotes()

  let allNotes = (
    <>
        <div className=' flex flex-row'>
            <p  className=' pl-1 text-2xl font-bold' >Notes</p>
            
        </div>
    </>
  )

  return (
    <PageContainer>
        {section == 'all notes' && allNotes}
    </PageContainer>
  )
}

export default Notes