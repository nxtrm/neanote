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
import utilsApi from '../../api/archiveApi';

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
  handleSaveTask: () => Promise<boolean>;
  handleEditTask: () => Promise<void>;
  handleDeleteTask: (taskId:UUID, noteId:UUID) => Promise<void>;
  toggleTaskCompleted: (taskId:UUID) => Promise<void>;
  toggleSubtaskCompleted: (subtaskId:UUID, taskId:UUID) => Promise<void>;
  archive: (noteId:UUID) => Promise<void>;
  
  fetchTaskPreviews: (pageParam:number) => Promise<void>;
  fetchTask: (noteId:string) => Promise<void>;
  nextPage: number;

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
    nextPage:0,

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

          }
          if (!state.pendingChanges) {
            state.pendingChanges = true;
          }

        });
        get().validateTask();
    },

      archive: async (noteId: UUID) => {
        const response = await utilsApi.archive(noteId);
        if (response.success) {
          set((state) => {
            state.tasks = state.tasks.filter((task) => task.noteid !== noteId);
          });
          showToast('success', 'Task archived successfully');
        } else {
          showToast('error', response.message);
        }
      },
      
      resetCurrentTask: () => {
        useTags.getState().selectedTagIds = [];
        set((state) => {
          state.section = 'all tasks';
          state.currentTask = generateNewCurrentTask()
          state.pendingChanges = false;
        })
      },
      

      fetchTaskPreviews: async (pageParam: number) => {
        set({ loading: true });
        try {
          const response = await tasksApi.getTaskPreviews(pageParam);
          if (response && response.success) {
            set({ tasks: response.data, nextPage: response.nextPage });
          }
          else {
            showToast('error', response.message);
          }
        } finally {
          set({ loading: false });
        }
      },

      fetchTask: async (noteId: string) => {
        set({ loading: true });
        try {
          const response = await tasksApi.getTask(noteId);
          if (response.success && response.data) {
            const dueDate = response.data.due_date ? new Date(response.data.due_date) : undefined;
            set((state) => {
              state.currentTask = { ...response.data, due_date: dueDate };
            });
          } else {
            showToast('error', response.message);
          }
        } finally {
          set({ loading: false });
        }
      },
    

      handleAddSubtask: () => {
        set((state) => {
          const subtasks = state.currentTask.subtasks;
          subtasks.push({ subtaskid: uuidv4(), description: '', completed: false, index: subtasks.length });
        });
        get().validateTask();
      },
  
      handleRemoveSubtask: (subtaskid: string) => {
        set((state) => {
          const subtasks = state.currentTask.subtasks.filter((subtask) => subtask.subtaskid !== subtaskid);
          subtasks.forEach((subtask, index) => (subtask.index = index));
          state.currentTask.subtasks = subtasks;
        });
        get().validateTask();
      },

      handleSaveTask: async () => {
        const { currentTask } = get();
        const { selectedTagIds } = useTags.getState();
        if (get().validateTask()) {
            const response = await tasksApi.create(currentTask.title, selectedTagIds, currentTask.content, currentTask.subtasks, currentTask.due_date);
            if (response && response.success) {
              set((state) => {
                state.tasks.push({ ...currentTask, taskid: response.data.taskid, noteid: response.data.noteid });
                state.section = 'all tasks';
                state.pendingChanges = false;
              });
              showToast('success', 'Task created successfully');
              return true
            } else {
              showToast('error', response.message);
            }
          } else {
            showToast('error', 'Validation failed');
        }
      return false

      },
  
      handleEditTask: async () => {
        const { currentTask} = get();
        const { selectedTagIds } = useTags.getState();
        try {
          if (get().validateTask()) {
            const updatedTask = { ...currentTask, tags: selectedTagIds };
            const response = await tasksApi.update(updatedTask);
  
          if (response && response.success) {
            set((state) => {
              state.tasks = state.tasks.map((task) => (task.taskid === currentTask.taskid ? currentTask : task));
              state.pendingChanges = false;
              state.loading = false;
            });
          } else {
            showToast('error', response.message);
          }
          } else {
            showToast('error', 'Validation failed');
          }

        } finally {
        }
      },

      handleDeleteTask: async (taskId: UUID, noteId: UUID) => {
        if (taskId && noteId) {
          const previousTasks = get().tasks;

          set((state) => {
            state.tasks = state.tasks.filter((task) => task.taskid !== taskId);
          });

          const response = await tasksApi.delete(taskId, noteId);
          if (response && response.success) {
              showToast('success', 'Task deleted successfully')
          } else {
              set({ tasks: previousTasks }); //revert
              showToast('error', response.message);
          }

        }
      },

      toggleTaskCompleted: async (taskId: UUID) => {

        set((state) => {
          state.tasks = state.tasks.map((task) => (task.taskid === taskId ? { ...task, completed: !task.completed } : task));
        });

        const response = await tasksApi.toggleCompleteness(taskId, null);
        if (!response || !response.success) {
          set((state) => {
            state.tasks = state.tasks.map((task) => (task.taskid === taskId ? { ...task, completed: !task.completed } : task));
          });
          showToast('error', 'Failed to toggle task completeness');
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
        await tasksApi.toggleCompleteness(taskId, subtaskId);
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
