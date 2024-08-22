import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    DialogOverlay,
  } from "../@/ui/dialog"
import { IoSparkles } from 'react-icons/io5';
import { Button } from '../@/ui/button';
import { FaShare } from 'react-icons/fa6';
import { showToast } from '../Toast';


  function SummarizeDialog({ text, onClose }: { text: string, onClose: () => void }) {
    const handleShare = () => {

    }
    return (
      <Dialog open={true} onOpenChange={onClose}>
      {/* <DialogOverlay onClick={onClose} /> */}
      <DialogContent>
        <DialogHeader>
        <DialogTitle className='flex flex-row gap-2 p-1 mb-2'><IoSparkles /> Summary</DialogTitle>
        <DialogDescription className=' rounded-xl bg-primary-foreground p-3'>
          <p>{text}</p>
        </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className='w-fit' variant={'outline'} onClick={onClose}>Close</Button>
          <DialogClose asChild>
            <Button className='w-fit gap-2' onClick={() => {
              navigator.clipboard.writeText(text)
              showToast('s', 'Summary copied to clipboard')
            }}><FaShare /> Share</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
      </Dialog>
    );}

export default SummarizeDialog