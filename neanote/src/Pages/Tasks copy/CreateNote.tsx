import React, { useEffect, useState } from 'react';
import { MdCancel } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/@/ui/button';
import FormButtons from '../../../components/FormButtons/FormButtons';
import FormInputs from './FormComponents/FormInputs';
import { useNotes } from './useNotes';

function CreateNote() {
  const {
    currentNote,
    pendingChanges, loading,
    updateCurrentNote,
    resetCurrentNote,
    validationErrors,
    handleSaveNote,
  } = useNotes();
  const navigate = useNavigate();

  const [isValidationErrorsEmpty, setIsValidationErrorsEmpty] = useState(true);

  useEffect(() => {
    setIsValidationErrorsEmpty(
      Object.keys(validationErrors).every(key => !validationErrors[key])
    );
  }, [validationErrors]);


  const handleClose = () => {
    localStorage.removeItem('currentNoteId');
    resetCurrentNote();
    navigate('/notes');
  };

  const handleSave = async () => {
    if (await handleSaveNote()) {
      navigate('/notes/edit');
    }
  };


  if (currentNote) {
  return (
    <>
        {/* Navbar */}
        <div className='flex flex-row justify-between'>
          <p className='pl-1 text-2xl font-bold'>Create Note</p>
          {/* Date Picker */}
          <div className='flex flex-row gap-2'>
            <Button size='icon' onClick={handleClose}>
              <MdCancel size={15} />
        </Button>
          </div>
        </div>
        {/* Title and tags */}
          <FormInputs title={currentNote.title} content={currentNote.content} validationErrors={validationErrors}/>

          <div className='flex pt-2 justify-between'>

            <FormButtons
                 pendingChanges={pendingChanges}
                 isValidationErrorsEmpty={isValidationErrorsEmpty}
                 loading={loading}
                 handleSave={handleSave}
                />

          </div>
      </>
  );
}
}

export default CreateNote;
