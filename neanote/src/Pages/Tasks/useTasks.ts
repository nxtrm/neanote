import { create } from 'zustand';
import tasksApi from '../../api/tasksApi';
import { Subtask, TaskPreview } from '../../api/types/taskTypes';



type TaskState = {
  section: string;
  currentId:number | undefined;
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
  handleEditTask: (taskId: number) => void;
  setCurrentTask: (task: TaskPreview) => void;
  pendingUpdates: {};
};


export let useTasks = create<TaskState>((set, get) => {
  const updateState = (key: keyof TaskState, value: any) => set({ [key]: value })
  ;
  return {

  section: 'all tasks',
  dueDate: undefined,
  currentId: undefined,
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
  
  setCurrentTask: (task: TaskPreview) => {
    set({currentId: task.id, taskTitle: task.title, tags: task.tags, textField: task.content, subtasks: task.subtasks, dueDate: task.due_date, dueTime: '' });

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

  handleEditTask: function() {
    const { sendUpdatesToServer, currentId } = get();
    let {
      taskTitle,
      tags, //replace with tag ids when tags module is done
      dueDate,
      dueTime,
      textField,
      subtasks, 
  } = get()

    if (typeof currentId === 'undefined') {
      console.error('currentId is undefined');
      return; // Exit the function if currentId is undefined
    }
    set((state) => {

      const updatedTask = {
        id: currentId,
        title: taskTitle,
        tags: tags,
        content: textField,
        subtasks: subtasks,
        dueDate: dueDate,
        dueTime: dueTime
      };
  
      // Update pendingUpdates with the single updated task
  
      // Update the specific task in the store
      const updatedTasks = state.tasks.map((task) => 
        task.id === currentId ? { ...task, ...updatedTask } : task
      );
  
      return { ...state, pendingUpdates: updatedTask, tasks: updatedTasks };
    });
    sendUpdatesToServer();
  },

  

  sendUpdatesToServer : async () => {
    const { pendingUpdates, tasks } = get();
    const updates = pendingUpdates;
    try {
        let response = await tasksApi.update(updates);
        if (response) {
    
          set({ pendingUpdates: {} }); //when tasks sent to server, clear pending updates
          set({
            taskTitle: '',
            tags: [],
            currentId: undefined,
            dueDate: undefined,
            dueTime: '',
            textField: '',
            subtasks: [],
            section: 'all tasks',
          });
        } else {

        }
      } catch (error) {
        // Handle error, maybe retry
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