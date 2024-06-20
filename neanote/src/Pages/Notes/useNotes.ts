import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type NoteState = {
    section: string,
    setSection: (section: string) => void,
}

export let useNotes = create<NoteState>(((set,get)=>({

    section:'all notes',

    setSection:(section)=>{
        set({section:section,})
    },
})))