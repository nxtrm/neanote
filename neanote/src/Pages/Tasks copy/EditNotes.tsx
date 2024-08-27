import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/@/ui/button';
import { Label } from '../../../components/@/ui/label';
import FormButtons from '../../../components/FormButtons/FormButtons';
import FormInputs from './FormComponents/FormInputs';
import { useNotes } from './useNotes';
import EditNotesSkeleton from './EditNotesSkeleton';

function EditNotes() {
  const {
    currentNote,
    pendingChanges,
    loading,
    fetchNote,
    updateCurrentNote,
    archive,
    handleEditNote,
    handleDeleteNote,
    resetCurrentNote,
    validationErrors,
  } = useNotes();

  const navigate = useNavigate();
  const [isValidationErrorsEmpty, setIsValidationErrorsEmpty] = useState(true);

  useEffect(() => {
    const noteId = localStorage.getItem('currentNoteId');
    if (noteId) {
      fetchNote(noteId);
    }
  }, [fetchNote, localStorage.getItem('currentNoteId')]);

  useEffect(() => {
    setIsValidationErrorsEmpty(
      Object.keys(validationErrors).every((key) => !validationErrors[key])
    );

  }, [validationErrors]);


  const handleClose = () => {
    localStorage.removeItem('currentNoteId');
    resetCurrentNote();
    navigate('/notes');
  };

  const handleSave = async () => {
    await handleEditNote();
  };

  const handleDelete = async () => {
    await handleDeleteNote(currentNote?.noteid);
    navigate('/notes');
  };

  const handleArchive = async () => {
    await archive(currentNote?.noteid);
    navigate('/notes');
  }

  if (loading) return <EditNotesSkeleton />;

  if (!currentNote) return null;

  return (
    <>
        <div className="flex flex-row justify-between">
          <p className="pl-1 text-2xl font-bold">Edit Note</p>
          <div className="flex flex-row gap-2">
            <Button size="icon" onClick={handleClose}>
              <MdCancel size={15} />
            </Button>
          </div>
        </div>

        <FormInputs title={currentNote.title} content={currentNote.content} validationErrors={validationErrors}/>

        <div className="rounded-md">
          {validationErrors['subnotes'] && (
            <Label className="text-destructive">{validationErrors['subnotes']}</Label>
          )}
          <div className="flex py-3 justify-between">
            <FormButtons
              pendingChanges={pendingChanges}
              isValidationErrorsEmpty={isValidationErrorsEmpty}
              loading={loading}
              hasDelete
              handleSave={handleSave}
              handleArchive={handleArchive}
              handleDelete={handleDelete}
            />
          </div>
        </div>
    </>
  );
}

export default EditNotes;
