import React, { ReactElement, ReactNode } from 'react'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '../@/ui/alert-dialog'
import { Button } from '../@/ui/button'

interface Props {
  children: ReactNode,
  handleDelete: () => void,
  handleArchive?: () => void
}

function DeleteDialog({children, handleDelete, handleArchive}:Props)  {
  return (
    <AlertDialog>
        <AlertDialogTrigger asChild>
            {children}
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the note and all its components from the server. {handleArchive && 'Maybe archive instead?' }
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <div className='flex flex-row gap-3'>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  { handleArchive &&
                  <AlertDialogAction onClick={handleArchive}>Archive instead</AlertDialogAction>
                  }
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </div>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteDialog