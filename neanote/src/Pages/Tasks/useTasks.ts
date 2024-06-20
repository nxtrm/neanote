import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type Subtask = {
  id: number;
  text: string;
  completed: boolean;
};

type TaskState = {
  section: string;
  taskTitle: string;
  tags: string[];
  textField: string;
  subtasks: Subtask[];
  setSection: (section: string) => void;
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


export let useTasks = create<TaskState>((set) => {
  const updateState = (key: keyof TaskState, value: any) => set({ [key]: value })

  return {
  section: 'all tasks',
  taskTitle: '',
  tags: [],
  textField: '',
  subtasks: [],
  setSection: (section) => updateState('section', section),
  setTaskTitle: (title) => updateState('taskTitle', title),
  setTags: (tags) => updateState('tags', tags),
  setTextField: (text) => updateState('textField', text),
  setSubtasks: (subtasks) => updateState('subtasks', subtasks),
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
  handleSubtaskChange: (index, field, value) => {
    set((state) => {
      const newSubtasks = [...state.subtasks];
      newSubtasks[index][field] = value;
      return { subtasks: newSubtasks };
    });
  },
  handleTagAdd: () => {
    const newTag = prompt("Enter new tag:");
    if (newTag) {
      set((state) => ({ tags: [...state.tags, newTag] }));
    }
  },
  handleSaveTask: () => {
    set({
      taskTitle: '',
      tags: [],
      textField: '',
      subtasks: [],
      section: 'all tasks',
    });
  },
  }
  
});