import { create } from 'zustand';
import tasksApi from '../../api/tasksApi';
import { Subtask, TaskPreview } from '../../api/types/taskTypes';
import { Tag } from '../../api/types/tagTypes';
import { useTags } from '../Tags/useTags';



type TaskState = {
  section: string;
  currentTaskId:number | undefined;
  currentNoteId: number | undefined;
  taskTitle: string;
  dueDate: Date | undefined;
  dueTime: string;
  tags: Tag[];
  selectedTagIds: number[];
  tasks: TaskPreview[];
  textField: string;
  subtasks: Subtask[];
  setSection: (section: string) => void;
  setDate: (date: Date | undefined) => void;
  setTime: (time: string) => void;
  setTaskTitle: (title: string) => void;
  setTags: (tags: string[]) => void;
  setSelectedTagIds: (tagIds: number[]) => void;
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
  handleEditTask: () => void;
  handleDeleteTask: (taskId: number | undefined, noteId: number| undefined) => void;
  setCurrentTask: (task: TaskPreview) => void;
  pendingUpdates: {};
};


export let useTasks = create<TaskState>((set, get) => {
  const updateState = (key: keyof TaskState, value: any) => set({ [key]: value })
  ;
  return {

  section: 'all tasks',
  dueDate: undefined,
  currentTaskId: undefined,
  currentNoteId: undefined,
  dueTime: '',
  taskTitle: '',
  tags: [],
  selectedTagIds: [],
  textField: '',
  subtasks: [],
  tasks: [],
  pendingUpdates: {},
  setSection: (section) => updateState('section', section),
  setTaskTitle: (title) => updateState('taskTitle', title),
  setTags: (tags) => updateState('tags', tags),
  setTextField: (text) => updateState('textField', text),
  setSubtasks: (subtasks) => updateState('subtasks', subtasks),
  setSelectedTagIds : (tagIds) => updateState('selectedTagIds', tagIds),


  fetchTasks: async () => {
    const fetchedTasks = await tasksApi.getAll();
    if (fetchedTasks)  {

      set({ tasks: fetchedTasks.data });
    }
  },

  setDate: (date: Date | undefined) => {
    if (!date) return; // If no date is provided, do nothing
    let newDate = new Date(date);
    set({ "dueDate": newDate });
    
    console.log('Date:', newDate);
  },

  handleAddSubtask: () => {
    set((state) => ({
      subtasks: [...state.subtasks, { subtaskid: state.subtasks.length + 1, description: '', completed: false }],
    }));
  },
  handleRemoveSubtask: (subtaskId) => {
    set((state) => ({
      subtasks: state.subtasks.filter((subtask) => subtask.subtaskid !== subtaskId),
    }));
  },
  handleSubtaskChange: (subtaskId: number, update: string) => {
    set((state) => {
      const newSubtasks = state.subtasks.map((subtask) => {
        if (subtask.subtaskid === subtaskId) {
          return { ...subtask, description: update};
        }
        return subtask;
      });
      return { ...state, subtasks: newSubtasks };
    });
  },
  
  setCurrentTask: (task: TaskPreview) => {
    set({currentNoteId:task.noteid, currentTaskId: task.taskid, taskTitle: task.title, tags: task.tags, textField: task.content, subtasks: task.subtasks, dueDate: task.due_date, dueTime: '' });

  },

  toggleSubtaskCompleted: async (subtaskId: number, taskId: number) => {
    let taskUpdated = false;
    let newTasks: TaskPreview[] = [];
  
    set((state) => {
      newTasks = state.tasks.map((task) => {
        if (task.taskid === taskId) {
          const newSubtasks = task.subtasks.map((subtask) => {
            if (subtask.subtaskid === subtaskId) {
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
        if (task.taskid === taskId) {
          return { ...task, completed: !task.completed };
        }
        return task;
      });
      return { ...state, tasks: newTasks };
    });
    await tasksApi.toggleCompleteness(taskId, null); 
  },

  handleEditTask: function() {
    const { sendUpdatesToServer, currentTaskId, currentNoteId} = get();
    const {tags}  = useTags.getState();
    let {
      taskTitle,
      selectedTagIds,
      dueDate,
      textField,
      subtasks, 
  } = get()

    if (typeof currentTaskId === 'undefined' || typeof currentNoteId === 'undefined') {
      console.error('currentId is undefined');
      return; // Exit the function if currentId is undefined
    }
    const filteredTags = tags.filter((tag) => selectedTagIds.includes(tag.tagid));

    set((state) => {

      const updatedTask = {
        taskid: currentTaskId,
        noteid: currentNoteId,
        title: taskTitle,
        tags: filteredTags,
        content: textField,
        subtasks: subtasks,
        dueDate: dueDate,
      };
  
      const updatedTasks = state.tasks.map((task) => 
        task.taskid === currentTaskId ? { ...task, ...updatedTask } : task
      );
  
      return { ...state, pendingUpdates: updatedTask, tasks: updatedTasks };
    });
    sendUpdatesToServer();
  },

  handleDeleteTask: async (taskId: number | undefined, noteId: number | undefined) => {
    if (taskId === undefined || noteId === undefined) {
      return
    }
    const { tasks, setSection } = get();
    set((state) => {
        const newTasks = state.tasks.filter((task) => task.taskid !== taskId);
      return { ...state, tasks: newTasks };
      });
    if( await tasksApi.delete(taskId, noteId)){
      setSection('all tasks')
    }
  
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
            currentTaskId: undefined,
            currentNoteId: undefined,
            dueDate: undefined,
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
    // const newTag = prompt("Enter new tag:");
    // if (newTag) {
    //   set((state) => ({ tags: [...state.tags,  newTag] }));
    // }
  },

  handleSaveTask : async() => {
    let {
        taskTitle,
        dueDate,
        textField,
        subtasks, 
        selectedTagIds,
    } = get()
    
    let response = await tasksApi.create(taskTitle,selectedTagIds,textField, subtasks, (dueDate ? dueDate.toISOString() : undefined))

    set({
      taskTitle: '',
      tags: [],
      dueDate: undefined,
      textField: '',
      subtasks: [],
      section: 'all tasks',
    });
  },
  
  }}
);
