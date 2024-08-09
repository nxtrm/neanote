import React from 'react';

import { FaSearch } from "react-icons/fa";
import { Button } from "../@/ui/button";
import {
    Dialog,
    DialogContent,
    DialogClose,
    DialogHeader,
    DialogTrigger
} from "../@/ui/dialog";
import { Input } from "../@/ui/input";
import { Label } from "../@/ui/label";
import ToggleButtons from './ToggleButtons';

function SearchBar() {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button className='rounded-xl px-5 w-[125px] gap-2'>
            <FaSearch className='justify-self-start' size={10} />
            <Label>Search...</Label>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
            <div className="flex w-full items-center space-x-2">
                <Input type="string" className='border-0' placeholder='Type here'/>
                <ToggleButtons/>

            </div>
        </DialogContent>
        <DialogClose></DialogClose>
      </Dialog>
    )
  }

export default SearchBar