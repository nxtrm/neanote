import { create } from 'zustand';

import Cookies from 'js-cookie';
import api from '../../api/api';
import { Subtask } from '../../api/types/taskTypes';


type TaskState = {
  section: string;
  taskTitle: string;
  dueDate: Date | undefined;
  dueTime: string;
  tags: string[];
  tasks: [];
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
    const userId = Cookies.get('userId')
    const fetchedTasks = await api.tasks.getAll(userId);
    if (fetchedTasks) {
      // Transform the fetched tasks to match the expected format
      const transformedTasks = fetchedTasks.map(task => ({
        ...task.note,
        ...task.task,
        completed: !!task.task.completed, // Convert to boolean if necessary
        subtasks: task.task.subtasks.map(subtask => ({
          ...subtask,
          completed: !!subtask.completed, // Convert to boolean
        })),
        tags: task.tags, // Assuming tags are already in the correct format
      }));

      set({ tasks: transformedTasks });
      console.log(transformedTasks);
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
    const userId = Cookies.get('userId')
    // console.log(userId)
    // const userId = 1 //FIX THIS
    
    let response = await api.tasks.create(userId, taskTitle,tags,textField, subtasks, dueDate, dueTime)

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