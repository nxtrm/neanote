import { create } from 'zustand';

import Cookies from 'js-cookie';
import tasks from '../../api/tasks';
import { Subtask, TaskPreview } from '../../api/types/taskTypes';


type TaskState = {
  section: string;
  taskTitle: string;
  dueDate: Date | undefined;
  dueTime: string;
  tags: string[];
  tasks: TaskPreview[];
  textField: string;
  subtasks: Subtask[];
  setSection: (section: string) => void;
  setDate: (date: Date | undefined) => void;
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
  fetchTasks: () => void;
};


export let useTasks = create<TaskState>((set, get) => {
  const updateState = (key: keyof TaskState, value: any) => set({ [key]: value })
  ;
  return {

  section: 'all tasks',
  dueDate: undefined,
  dueTime: '',
  taskTitle: '',
  tags: [],
  textField: '',
  subtasks: [],
  tasks: [],
  setSection: (section) => updateState('section', section),
  setTaskTitle: (title) => updateState('taskTitle', title),
  setTags: (tags) => updateState('tags', tags),
  setTextField: (text) => updateState('textField', text),
  setSubtasks: (subtasks) => updateState('subtasks', subtasks),


  fetchTasks: async () => {
    const fetchedTasks = await tasks.getAll();
    if (fetchedTasks)  {

      set({ tasks: fetchedTasks.data });
      console.log(fetchedTasks);
    }
  },

  setDate: (date: Date | undefined) => {
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
          const newSubtasks: Subtask[] = [...state.subtasks];
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

    
    let response = await tasks.create(taskTitle,tags,textField, subtasks, dueDate, dueTime)

    set({
      taskTitle: '',
      tags: [],
      dueDate: undefined,
      dueTime: '',
      textField: '',
      subtasks: [],
      section: 'all tasks',
    });
  },
  
  }}
);