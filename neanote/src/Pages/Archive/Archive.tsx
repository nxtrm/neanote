import React, { useEffect } from 'react'
import PageContainer from '../../../components/PageContainer/PageContainer'
import { useArchive } from './useArchive';
import ArchiveCard from './Components/ArchiveCard';
import { FaArchive } from 'react-icons/fa';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import PaginationSelector from '../../../components/Pagination/PaginationSelector';

function Archive() {
    const { fetchArchivedNotes, nextPage, archive, page } = useArchive();

    useEffect(() => {
        fetchArchivedNotes(page);
    },[fetchArchivedNotes]) 

  return (
    <>
        <div className="flex flex-row gap-3 items-center pb-2">
            <TitleComponent><FaArchive size={'20px'}/> Archive</TitleComponent>
        </div> 
        <div className='flex flex-col flex-grow gap-2'>
        { archive.map((note) => (
            <ArchiveCard key={note.noteid} note={note}/>
        ))}
        <p className='pl-1 text-destructive text-sm ml-1'>Archived notes will be removed after 30 days if not in use</p>
        </div>
        <div className="p-1 pt-2">
            <PaginationSelector fetchingFunction={fetchArchivedNotes} nextPage={nextPage} page={page}/>
        </div>
    </>
  )
}

export default Archive