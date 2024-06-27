import { create } from 'zustand';
import tasksApi from '../../api/tasksApi';
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
  handleTagAdd: () => void;
  handleSaveTask: () => Promise<void>; 
  handleSubtaskChange: (subtaskId: number, update: string) => void;
  fetchTasks: () => Promise<void>;
  toggleTaskCompleted: (taskId: number) => void;
  toggleSubtaskCompleted: (subtaskId: number, taskId: number) => void;
  sendUpdatesToServer: () => Promise<void>;
  onTaskUpdate: (taskId: number) => void;
  pendingUpdates: {[taskId :number] : TaskPreview};
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
  pendingUpdates: {},
  setSection: (section) => updateState('section', section),
  setTaskTitle: (title) => updateState('taskTitle', title),
  setTags: (tags) => updateState('tags', tags),
  setTextField: (text) => updateState('textField', text),
  setSubtasks: (subtasks) => updateState('subtasks', subtasks),


  fetchTasks: async () => {
    const fetchedTasks = await tasksApi.getAll();
    if (fetchedTasks)  {

      set({ tasks: fetchedTasks.data });
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
  handleSubtaskChange: (subtaskId: number, update: string) => {
    set((state) => {
      const newSubtasks = state.subtasks.map((subtask) => {
        if (subtask.id === subtaskId) {
          return { ...subtask, description: update};
        }
        return subtask;
      });
      return { ...state, subtasks: newSubtasks };
    });
  },
  

  toggleSubtaskCompleted: async (subtaskId: number, taskId: number) => {
    let taskUpdated = false;
    let newTasks: TaskPreview[] = [];
  
    set((state) => {
      newTasks = state.tasks.map((task) => {
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
  
      return { ...state, tasks: newTasks };
    });
  
    if (taskUpdated) {
      await tasksApi.toggleCompleteness(taskId, subtaskId);
    }
  },

  toggleTaskCompleted: async (taskId: number) => {
    set((state) => {
      const newTasks = state.tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, completed: !task.completed };
        }
        return task;
      });
      return { ...state, tasks: newTasks };
    });
    await tasksApi.toggleCompleteness(taskId, null); 
  },

  onTaskUpdate: function(taskId: number) {
    const { sendUpdatesToServer } = get();
    set((state) => {
        // Update pendingUpdates with the new state of the task
        const updatedTask = state.tasks.find((task) => task.id === taskId);
        const newPendingUpdates = {
          ...state.pendingUpdates,
          [taskId]: updatedTask, // Use task ID as key for easy update/overwrite
        };
        return { ...state, pendingUpdates: newPendingUpdates };
      })
    sendUpdatesToServer();
    },

  sendUpdatesToServer : async () => {
    const { pendingUpdates, tasks } = get();
    const updates = tasks.filter(task => pendingUpdates[task.id]);
    if (updates.length > 0) {
      try {
        let response = await tasksApi.update(updates);
        if (response) {
    
          set({ pendingUpdates: {} }); //when tasks sent to server, clear pending updates
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