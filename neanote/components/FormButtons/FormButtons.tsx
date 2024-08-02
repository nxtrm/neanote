    
import React from 'react'
import DeleteDialog from '../DeleteDialog/DeleteDialog';
import { Button } from '../@/ui/button';
import { FaSave, FaTrash } from 'react-icons/fa';

interface Props {
    handleArchive?: () => void;
    handleDelete?: () => void
    handleSave: () => void
    pendingChanges: boolean
    isValidationErrorsEmpty: boolean

}

function FormButtons() {
  return (
    <div className="flex flex-row gap-2">
        <DeleteDialog handleArchive={()=>(console.log("archived"))} handleDelete={handleDelete}>
          <Button size={"icon"} variant="outline">
            <FaTrash />
          </Button>
        </DeleteDialog>
        <Button size={"icon"} disabled={!pendingChanges || !isValidationErrorsEmpty} onClick={handleSave}>
          <FaSave />
        </Button>
        <Button size={"icon"} disabled={!pendingChanges || !isValidationErrorsEmpty} onClick={handleSave}>
          <FaSave />
        </Button>
    </div>
  )
}

export default FormButtons
