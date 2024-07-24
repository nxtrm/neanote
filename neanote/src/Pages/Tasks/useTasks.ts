import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import tasksApi from '../../api/tasksApi';
import { Task, TaskResponse } from '../../api/types/taskTypes';
import { useTags } from '../Tags/useTags';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';
import { TaskSchema } from '../../formValidation';
import { z } from 'zod';
import { showToast } from '../../../components/Toast';

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

  validationErrors: Record<string, string | undefined>;
  validateTask: () => boolean;
};

export const useTasks = create<TaskState>()(
  immer((set, get) => ({
    section: 'all tasks',
    selectedTagIds: [],
    tasks: [],
    loading: false,
    validationErrors: {},
    currentTask: generateNewCurrentTask(),

    pendingChanges: false,

    setPendingChanges: (value) => set({pendingChanges: value}),
    
    setLoading : (loading) => set({ loading }),
    
    setSection: (section) => set({ section }),

    validateTask: () => {
      const { currentTask } = get();
      const result = TaskSchema.safeParse(currentTask);
      if (!result.success) {
        set((state) => {
          const errors = Object.fromEntries(
            Object.entries(result.error.flatten().fieldErrors).map(([key, value]) => [key, value.join(", ")])
          );
          state.validationErrors = errors;
        });
        return false;
      } else {
        set((state) => {
          state.validationErrors = {};
        });
        return true;
      }
    },

      updateCurrentTask: <K extends keyof Task>(key: K, value: Task[K]) => {
      set((state) => {
        if (state.currentTask) {
          state.currentTask[key] = value;
          state.pendingChanges = true;
        }
      });
      get().validateTask();
    },

      
      resetCurrentTask: () => {
        set((state) => {
          state.currentTask = generateNewCurrentTask()
          state.pendingChanges = false;
        })
      },
      

    fetchTaskPreviews: async (pageParam: number) => {
        const {tasks} = get()
        useTasks.getState().setLoading(true)
        const fetchedTasks = await tasksApi.getTaskPreviews(pageParam);
        if (fetchedTasks) { 
          set({ tasks: fetchedTasks.data })
          console.log(tasks)
        }
        useTasks.getState().setLoading(false)
      },

    fetchTask : async (noteId:string) => {
      useTasks.getState().setLoading(true);
      const response = await tasksApi.getTask(noteId);
      if (response && response.task) {
        const dueDate = response.task.due_date ? new Date(response.task.due_date) : undefined;
        const taskWithFormattedDate = {
          ...response.task,
          due_date: dueDate,
        };
        set((state) => {
          state.currentTask = taskWithFormattedDate;

        });
      }
      useTasks.getState().setLoading(false);
      return response
    }
    ,
    

    handleAddSubtask: () => 
      set((state) => {
        if (state.currentTask) {
          const subtasks = state.currentTask.subtasks
          subtasks.push({ subtaskid: uuidv4(), description: '', completed: false, index: subtasks.length ? subtasks[subtasks.length - 1].index + 1 : 0 });

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
        const { selectedTagIds } = useTags.getState();
        setLoading(true);
  
        if (get().validateTask()) {
          const { title, content, subtasks, due_date } = currentTask;
          const response = await tasksApi.create(title, selectedTagIds, content, subtasks, due_date);
  
          if (response) {
            set((state) => {
              state.tasks.push({ ...currentTask, taskid: response.data.taskid, noteid: response.data.noteid });
              state.section = 'all tasks';
              state.pendingChanges = false;
              state.loading = false;
            });
          }
        } else {
          setLoading(false);
          showToast('error', 'Validation failed');
        }
      },
  
      handleEditTask: async () => {
        const { currentTask, setLoading } = get();
        const { selectedTagIds } = useTags.getState();
        setLoading(true);
  
        if (get().validateTask()) {
          const updatedTask = { ...currentTask, tags: selectedTagIds };
          const response = await tasksApi.update(updatedTask);
  
          if (response) {
            set((state) => {
              state.tasks = state.tasks.map((task) => (task.taskid === currentTask.taskid ? currentTask : task));
              state.pendingChanges = false;
              state.loading = false;
            });
          }
        } else {
          setLoading(false);
          showToast('error', 'Validation failed');

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
      const {tasks, section} = get()
      console.log(tasks)
      set((state) => {
        if (section === 'all tasks') {
          state.tasks = state.tasks.map((task) => 
            task.taskid === taskId ? { ...task, completed: !task.completed } : task
        );
      } else {

        state.currentTask = state.currentTask ? { ...state.currentTask, completed: !state.currentTask.completed } : state.currentTask;
      }
      });
      const response = await tasksApi.toggleCompleteness(taskId, null);

      // Revert the state if the API call fails
      if (!response) {
        set((state) => {
          if (section === 'all tasks') {

            state.tasks = state.tasks.map((task) => 
              task.taskid === taskId ? { ...task, completed: !task.completed } : task
          );
        } else {

          state.currentTask = state.currentTask ? { ...state.currentTask, completed: !state.currentTask.completed } : state.currentTask;
        }
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
      try {
        const response = await tasksApi.toggleCompleteness(taskId, subtaskId);
      } catch (error) {
        // Revert subtask completion on failure
        set((state) => {
          state.tasks = state.tasks.map((task) => {
            if (task.taskid === taskId) {
              const revertedSubtasks = task.subtasks.map((subtask) => 
                subtask.subtaskid === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
              );
              return { ...task, subtasks: revertedSubtasks };
            }
            return task;
          });
        });
      }
    },

    setCurrentTask: (task) => 
      set((state) => {
        state.currentTask = { ...task };
        useTags.getState().selectedTagIds = task.tags.map((tag) => tag.tagid);
      }),
  }))
);
