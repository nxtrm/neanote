import { create } from 'zustand';

import { useUser } from '../../../components/providers/useUser';
import api from '../../api';
import { useToast } from '../../../components/@/ui/use-toast';

type Subtask = {
  id: number;
  text: string;
  completed: boolean;
};

type TaskState = {
  section: string;
  taskTitle: string;
  dueDate: Date;
  dueTime: string;
  tags: string[];
  textField: string;
  subtasks: Subtask[];
  setSection: (section: string) => void;
  setDate: (date: Date) => void;
  setTime: (time: string) => void;
  setTaskTitle: (title: string) => void;
  setTags: (tags: string[]) => void;
  setTextField: (text: string) => void;
  setSubtasks: (subtasks: Subtask[]) => void;
  handleAddSubtask: () => void;
  handleRemoveSubtask: (subtaskId: number) => void;
  handleSubtaskChange: (index: number, field: keyof Subtask, value: any) => void;
  handleTagAdd: () => void;
  handleSaveTask: () => void;
};


export let useTasks = create<TaskState>((set, get) => {
  const updateState = (key: keyof TaskState, value: any) => set({ [key]: value })
  ;
  return {

  section: 'all tasks',
  dueDate: new Date(),
  dueTime: '',
  taskTitle: '',
  tags: [],
  textField: '',
  subtasks: [],
  setSection: (section) => updateState('section', section),
  setTaskTitle: (title) => updateState('taskTitle', title),
  setTags: (tags) => updateState('tags', tags),
  setTextField: (text) => updateState('textField', text),
  setSubtasks: (subtasks) => updateState('subtasks', subtasks),

  setDate: (date: Date) => {
    updateState('dueDate', date);
  },
  setTime: (time: string) => updateState('dueTime', time),

  handleAddSubtask: () => {
    set((state) => ({
      subtasks: [...state.subtasks, { id: state.subtasks.length + 1, text: '', completed: false }],
    }));
  },
  handleRemoveSubtask: (subtaskId) => {
    set((state) => ({
      subtasks: state.subtasks.filter((subtask) => subtask.id !== subtaskId),
    }));
  },
  handleSubtaskChange: (index: number, field: keyof Subtask, value: Subtask[keyof Subtask]) => {
      set((state) => {
          const newSubtasks = [...state.subtasks];
          newSubtasks[index][field] = value;
          return { subtasks: newSubtasks };
      });
  },
  handleTagAdd: () => {
    const newTag = prompt("Enter new tag:");
    if (newTag) {
      set((state) => ({ tags: [...state.tags,  newTag] }));
    }
  },

  handleSaveTask : async() => {
    let {
        taskTitle,
        tags, //replace with tag ids when tags module is done
        dueDate,
        dueTime,
        textField,
        subtasks, 
    } = get()
    const userId = useUser.getState().userId
    // const userId = 1 //FIX THIS
    
    let response = await api.tasks.create(userId, taskTitle,tags,textField, subtasks, dueDate, dueTime)

    set({
      taskTitle: '',
      tags: [],
      textField: '',
      subtasks: [],
      section: 'all tasks',
    });
  },
  
  }}
);