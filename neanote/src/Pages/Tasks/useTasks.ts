import { create } from 'zustand';
import tasksApi from '../../api/tasks';
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
  handleSubtaskChange: (index: number, field: keyof Subtask, value: string | boolean) => void; // Assuming Subtask fields are strings or booleans
  handleTagAdd: () => void;
  handleSaveTask: () => Promise<void>; // Assuming this might be async
  fetchTasks: () => Promise<void>; // Assuming this is async
  toggleTaskCompleted: (taskId: number) => void;
  toggleSubtaskCompleted: (subtaskId: number, taskId: number) => void;
  sendUpdatesToServer: () => Promise<void>;
  pendingUpdates: [taskId:number] | [];
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
  pendingUpdates: [],
  setSection: (section) => updateState('section', section),
  setTaskTitle: (title) => updateState('taskTitle', title),
  setTags: (tags) => updateState('tags', tags),
  setTextField: (text) => updateState('textField', text),
  setSubtasks: (subtasks) => updateState('subtasks', subtasks),


  fetchTasks: async () => {
    const fetchedTasks = await tasksApi.getAll();
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
      subtasks: [...state.subtasks, { id: state.subtasks.length + 1, description: '', completed: false }],
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

  toggleSubtaskCompleted: (subtaskId: number, taskId: number) => {
    set((state) => {
      let taskUpdated = false;
      const newTasks = state.tasks.map((task) => {
        if (task.id === taskId) {
          const newSubtasks = task.subtasks.map((subtask) => {
            if (subtask.id === subtaskId) {
              taskUpdated = true; // Mark that an update is needed
              return { ...subtask, completed: !subtask.completed };
            }
            return subtask;
          });
          return { ...task, subtasks: newSubtasks };
        }
        return task;
      });
  
      // Only update state if a change was actually made
      if (taskUpdated) {
        // Mark the task as pending update
        const newPendingUpdates = { ...state.pendingUpdates, taskId };
        return { ...state, tasks: newTasks, pendingUpdates: newPendingUpdates };
      }
      return state;
    });
  },
  
  toggleTaskCompleted: (taskId: number) => {
    set((state) => {
      let taskUpdated = false;
      const newTasks = state.tasks.map((task) => {
        if (task.id === taskId) {
          taskUpdated = true; // Mark that an update is needed
          return { ...task, completed: !task.completed };
        }
        return task;
      });
  
      if (taskUpdated) {
        // Assuming all tasks have a 'completed' property and optionally 'subtasks'
        const newPendingUpdates = {
          ...state.pendingUpdates,
          taskId
        };
        return { ...state, tasks: newTasks, pendingUpdates: newPendingUpdates };
      }
      return state;
    });
  },

  sendUpdatesToServer : async () => {
    const { pendingUpdates, tasks } = get();
    const updates = tasks.filter(task => pendingUpdates[task.id]);
    if (updates.length > 0) {
      try {
        let response = await tasksApi.batchUpdate(updates);
        if (response) {
          set({ pendingUpdates: [] }); //when tasks sent to server, clear pending updates
        } else {

        }
      } catch (error) {
        // Handle error, maybe retry
      }
    }
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

    
    let response = await tasksApi.create(taskTitle,tags,textField, subtasks, dueDate, dueTime)

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