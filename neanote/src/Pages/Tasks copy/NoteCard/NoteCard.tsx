import React, { useEffect, useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import TagLabel from '../../../../components/TagLabel/TagLabel';
import { Note } from '../../../../src/api/types/noteTypes';
import { useNotes } from '../useNotes';
import { Button } from '../../../../components/@/ui/button';
import { Separator } from "../../../../components/@/ui/separator";
import './NoteCard.css';
import { useScreenSize } from '../../../../src/DisplayContext';
import SkeletonCard from '../../../../components/TaskCard/SkeletonCard';


function NoteCard({ note }: { note: Note }) {
  const {
    setSection,
    loading,
  } = useNotes();


  const navigate = useNavigate();

  var { isDateCollapsed, isTagCompressed } = useScreenSize();

  function handleEditClick(noteId) {
    setSection('edit');
    localStorage.setItem('currentNoteId', noteId.toString());
    navigate('/notes/edit');
  }

  if (loading) {
    return <SkeletonCard />;
  }

  return (
    <div className='p-3 w-full rounded-xl border-[2px]'>
      <div className='flex flex-row items-center gap-3 justify-between'>
        <div className='flex flex-row items-center gap-3'>
          <h3 className="note-title">{note.title}</h3>
        </div>
        <div className='flex flex-row items-center gap-1'>
          {note.tags.map((tag, index) => (
            <TagLabel key={index} name={tag.name} color={tag.color} compressed={isTagCompressed} />
          ))}
          <Button variant="ghost" size={"icon"} onClick={() => handleEditClick(note.noteid)}><FaEdit /></Button>
        </div>
      </div>
      {note.content && <p className="text-md pl-1 pt-2">{note.content}</p>}
    </div>
  );
}

  export default NoteCard;