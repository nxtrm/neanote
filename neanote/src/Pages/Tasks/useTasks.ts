import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import tasksApi from '../../api/tasksApi';
import { Task, TaskResponse } from '../../api/types/taskTypes';
import { useTags } from '../Tags/useTags';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';

const generateNewCurrentTask = () => {

  return {
    taskid: uuidv4(),
    noteid: uuidv4(),
    title: '',
    tags: [],
    content: '',
    subtasks: [],
    due_date: undefined,
    completed: false,
  };
};

type TaskState = {
  loading:boolean;
  setLoading: (loading: boolean) => void;
  
  section: string;
  setSection: (section: string) => void;

  currentTask: Task;
  setCurrentTask: (task: Task) => void;
  resetCurrentTask: () => void;
  updateCurrentTask: (key: keyof Task, value: any) => void;

  tasks: Task[];
  handleAddSubtask: () => void;
  handleRemoveSubtask: (subtaskId:UUID) => void;
  handleSaveTask: () => Promise<void>;
  handleEditTask: () => Promise<void>;
  handleDeleteTask: (taskId:UUID, noteId:UUID) => Promise<void>;
  toggleTaskCompleted: (taskId:UUID) => Promise<void>;
  toggleSubtaskCompleted: (subtaskId:UUID, taskId:UUID) => Promise<void>;
  
  fetchTaskPreviews: (pageParam:number) => Promise<void>;
  fetchTask: (noteId:string) => Promise<TaskResponse | false>;

  pendingChanges:boolean
  setPendingChanges(value: boolean): void;
};

export const useTasks = create<TaskState>()(
  immer((set, get) => ({
    section: 'all tasks',
    selectedTagIds: [],
    tasks: [],
    loading: false,
    currentTask: generateNewCurrentTask(),

    pendingChanges: false,

    setPendingChanges: (value) => set({pendingChanges: value}),
    
    setLoading : (loading) => set({ loading }),
    
    setSection: (section) => set({ section }),
    
    updateCurrentTask: <K extends keyof Task>(key: K, value: Task[K]) => 
      set((state) => {
        if (state.currentTask) {
          state.currentTask[key] = value;
          state.pendingChanges = true;
        }
      }),
      
      resetCurrentTask: () => {
        set((state) => {
          state.currentTask = generateNewCurrentTask()
          state.pendingChanges = false;
        })
      },
      

    fetchTaskPreviews: async (pageParam: number) => {
        const setLoading = useTasks.getState().setLoading;
        const fetchedTasks = await tasksApi.getTaskPreviews(pageParam);
        if (fetchedTasks) { 
          set({ tasks: fetchedTasks.data })
        }
      },

    fetchTask : async (noteId:string) => {
      const response = await tasksApi.getTask(noteId);
      if (response) {
        set((state) => {
          state.currentTask = response.data;
        });
      }
      return response
    }
    ,
    

    handleAddSubtask: () => 
      set((state) => {
        if (state.currentTask) {
          const subtasks = state.currentTask.subtasks
          subtasks.push({ subtaskid: uuidv4(), description: '', completed: false, index: subtasks.length });

          subtasks.forEach((st, idx) => st.index = idx);
        }
      }),

    handleRemoveSubtask: (subtaskid) => 
      set((state) => {
        if (state.currentTask) {
          const subtasks = state.currentTask.subtasks.filter((subtask) => subtask.subtaskid !== subtaskid);
          subtasks.forEach((ms, idx) => ms.index = idx);
          state.currentTask.subtasks = subtasks;
        }
      }),

    handleSaveTask: async () => {
      const { currentTask, setLoading } = get();
      const {selectedTagIds} = useTags.getState();
      setLoading(true);

      if (currentTask) {
        // const result = TaskSchema.safeParse(currentTask);

        // if (!result.success) {
        //   showToast('e', 'Please fill in all required fields');
        //   return; 
        // }
        
        const {title, content, subtasks, due_date } = currentTask;
        const response = await tasksApi.create(title, selectedTagIds, content, subtasks, due_date ? due_date.toISOString() : undefined);

        if (response) {
          set((state) => {
            state.tasks.push(currentTask) //assign ids here
            state.section = 'all tasks';
            state.pendingChanges = false;
            state.loading = false;
          });
        }
      }
    },

    handleEditTask: async () => {
      const { currentTask, setLoading } = get();
      const { tags, selectedTagIds } = useTags.getState();
      setLoading(true);

      if (currentTask) {

        // const result = TaskSchema.safeParse(currentTask);

        // if (!result.success) {
        //   showToast('e', 'Please fill in all required fields');
        //   return; 
        // }

        const { taskid, noteid, title, content, subtasks, due_date } = currentTask;
        const filteredTags = tags.filter((tag) => selectedTagIds.includes(tag.tagid));

        const updatedTask: Task = {
          ...currentTask,
          title,
          tags: filteredTags,
          content,
          subtasks,
          due_date,
        };

        const previousTasks = get().tasks;

        // optimistic update
        set((state) => {
            state.tasks = state.tasks.map((task) => (task.taskid === taskid ? updatedTask : task));
          });

        const response = await tasksApi.update(updatedTask);
        if (!response) {
          // revert update
          set({ 
            tasks: previousTasks ,
          });
        } else {
          set((state) => {
            state.pendingChanges = false
            setLoading(false);
          })
        }

      }
      },

    handleDeleteTask: async (taskId, noteId) => {
      if (taskId && noteId) {
        const previousTasks = get().tasks;
        set((state) => {
          state.tasks = state.tasks.filter((task) => task.taskid !== taskId);
        });
      
        const response = await tasksApi.delete(taskId, noteId);
      
        // Revert the state if the API call fails
        if (!response) {
          set({ tasks: previousTasks });
        }
      }
    },

    toggleTaskCompleted: async (taskId) => {
      set((state) => {
        state.tasks = state.tasks.map((task) => 
          task.taskid === taskId ? { ...task, completed: !task.completed } : task
        );
      });
      const response = await tasksApi.toggleCompleteness(taskId, null);

      // Revert the state if the API call fails
      if (!response) {
        set((state) => {
          state.tasks = state.tasks.map((task) => 
            task.taskid === taskId ? { ...task, completed: !task.completed } : task
          );
        });
      }
    },

    toggleSubtaskCompleted: async (subtaskId, taskId) => {
      set((state) => {
        state.tasks = state.tasks.map((task) => {
          if (task.taskid === taskId) {
            const newSubtasks = task.subtasks.map((subtask) => 
              subtask.subtaskid === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
            );
            return { ...task, subtasks: newSubtasks };
          }
          return task;
        });
      });
      await tasksApi.toggleCompleteness(taskId, subtaskId);
    },

    setCurrentTask: (task) => 
      set((state) => {
        state.currentTask = { ...task };
        useTags.getState().selectedTagIds = task.tags.map((tag) => tag.tagid);
      }),
  }))
);
