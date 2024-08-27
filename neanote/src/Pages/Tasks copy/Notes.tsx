import React, { useEffect, useState } from 'react';
import { FaPlus,  FaRegNoteSticky } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/@/ui/button';
import PaginationSelector from '../../../components/Pagination/PaginationSelector';
import NoteCard from './NoteCard/NoteCard';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import { useNotes } from './useNotes';

const Notes: React.FC = () => {
  const { notes, setSection, fetchNotePreviews, resetCurrentNote, nextPage, page } = useNotes();
  const navigate = useNavigate();

  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  useEffect(() => {
      const fetchIfNeeded = () => {
        // Check if never fetched or if 5 minutes have passed since the last fetch
        if (!lastFetchTime || new Date().getTime() - lastFetchTime.getTime() > 300000) {
          fetchNotePreviews(page);
          setLastFetchTime(new Date());
        }
      };
  
      fetchIfNeeded();
  
      // Set up a timer to refetch every 5 minutes
      const intervalId = setInterval(fetchIfNeeded, 300000);
  
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchNotePreviews, lastFetchTime]);

  const handleAddNoteClick = () => {
    resetCurrentNote();
    setSection('create');
    navigate('/notes/create')
  };

  return (
    <>
      <div className="flex flex-row justify-between pb-2">
        <TitleComponent>
          <FaRegNoteSticky size={'20px'} /> Notes
        </TitleComponent>
        <Button size="sm" className="gap-2" onClick={handleAddNoteClick}>
          <FaPlus />
          Add Note
        </Button>
      </div>
      <div className="flex flex-col gap-3 flex-grow">
        {notes.map((note) => (
          <NoteCard key={note.noteid} note={note} />
        ))}
      </div>
      <div className="p-1 pt-2">
        <PaginationSelector fetchingFunction={fetchNotePreviews} nextPage={nextPage} page={page}/>
      </div>
    </>
  );
}; //TODO: pagination per_page

export default Notes;
