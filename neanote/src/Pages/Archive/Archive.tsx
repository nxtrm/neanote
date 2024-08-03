import React, { useEffect } from 'react'
import PageContainer from '../../../components/PageContainer/PageContainer'
import { useArchive } from './useArchive';

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
           { archive.map((note) => (
                <div key={note.noteid} className="flex flex-row justify-between p-2 border-b-2">
                    <div className="flex flex-col">
                        <p className="text-lg font-semibold">{note.title}</p>
                        <p className="text-sm">{note.content}</p>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm">{note.type}</p>
                    </div>
                </div>
            ))}
        </div>
    </PageContainer>
  )
}

export default Archive