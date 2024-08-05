import React, { useEffect } from 'react'
import PageContainer from '../../../components/PageContainer/PageContainer'
import { useArchive } from './useArchive';
import NoteCard from './Components/NoteCard';
import { FaArchive } from 'react-icons/fa';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';

function Archive() {
    const { fetchArchivedNotes, nextPage, archive } = useArchive();

    useEffect(() => {
        fetchArchivedNotes(nextPage? nextPage : 1);
    },[fetchArchivedNotes]) 

  return (
    <PageContainer>
        <div className="p-1">
            <div className="flex flex-row gap-3 items-center pb-2">
                <TitleComponent><FaArchive size={'20px'}/> Archive</TitleComponent>
            </div> 
            <div className='flex flex-col gap-2'>
            { archive.map((note) => (
                <NoteCard note={note}/>
            ))}
            <p className='pl-1 text-destructive text-sm ml-1'>Archived notes will be removed after 30 days if not in use</p>
            </div>
        </div>
    </PageContainer>
  )
}

export default Archive