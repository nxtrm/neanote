import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type TaskState = {
    section: string,
    setSection: (section: string) => void,
}

export let useTasks = create<TaskState>(((set,get)=>({

    section:'all tasks',

    setSection:(section)=>{
        set({section:section,})
    },
})))