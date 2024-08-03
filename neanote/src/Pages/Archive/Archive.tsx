import React, { useEffect } from 'react'
import PageContainer from '../../../components/PageContainer/PageContainer'
import { useArchive } from './useArchive';
import NoteCard from './Components/NoteCard';

function Archive() {
    const { fetchArchivedNotes, nextPage, archive } = useArchive();

    useEffect(() => {
        fetchArchivedNotes(nextPage? nextPage : 1);
    },[fetchArchivedNotes]) 

  return (
    <PageContainer>
        <div className="p-1">
            <div className="flex flex-row justify-between pb-2">
                <p className="pl-1 text-2xl font-bold">Archive</p>
            </div>
            <div className='flex flex-col gap-2'>
            { archive.map((note) => (
                <NoteCard note={note}/>
                ))}
            </div>
        </div>
    </PageContainer>
  )
}

export default Archive