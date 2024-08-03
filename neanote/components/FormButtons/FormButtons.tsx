    
import React from 'react'
import DeleteDialog from '../DeleteDialog/DeleteDialog';
import { Button } from '../@/ui/button';
import { FaSave, FaTrash,FaArchive } from 'react-icons/fa';

interface Props {
    handleArchive?: () => void;
    handleDelete?: () => void
    handleSave: () => void
    pendingChanges: boolean
    loading:boolean
    isValidationErrorsEmpty: boolean
    hasDelete?: boolean

}

function FormButtons({handleArchive,loading, handleDelete, handleSave, pendingChanges, isValidationErrorsEmpty, hasDelete}: Props) {
  return (
    <div className="flex flex-row gap-2">
        {hasDelete && (
            <>
                <DeleteDialog handleArchive={handleArchive} handleDelete={handleDelete}>
                <Button size={"icon"} variant="outline">
                    <FaTrash /> 
                </Button>
                </DeleteDialog>
                <Button className='gap-2' variant="outline" aria-label='archive' disabled={pendingChanges} onClick={handleArchive}>
                    <FaArchive />  Archive
                </Button> 
            </>
        )
        }
        <Button className='gap-2' disabled={!pendingChanges || !isValidationErrorsEmpty} onClick={handleSave}>
          <FaSave /> {loading ? 'Saving...' : 'Save'}
        </Button>
    </div>
  )
}

export default FormButtons
