import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import tasksApi from '../../api/tasksApi';
import { Task, TaskResponse } from '../../api/types/taskTypes';
import { useTags } from '../Tags/useTags';

type TaskState = {
  loading:boolean;
  setLoading: (loading: boolean) => void;
  section: string;
  currentTask: Task | null;
  tasks: Task[];
  pendingUpdates: Partial<Task> | null;
  setSection: (section: string) => void;
  updateCurrentTask: (key: keyof Task, value: any) => void;
  handleAddSubtask: () => void;
  handleRemoveSubtask: (subtaskId: number) => void;
  handleSaveTask: () => Promise<void>;
  handleEditTask: () => Promise<void>;
  handleDeleteTask: (taskId: number | undefined, noteId: number | undefined) => Promise<void>;
  toggleTaskCompleted: (taskId: number) => Promise<void>;
  toggleSubtaskCompleted: (subtaskId: number, taskId: number) => Promise<void>;
  setCurrentTask: (task: Task) => void;
  
  fetchTaskPreviews: (pageParam:number) => Promise<void>;
  fetchTask: (noteId: number) => Promise<TaskResponse | false>;
};

export const useTasks = create<TaskState>()(
  immer((set, get) => ({
    section: 'all tasks',
    currentTask: null,
    selectedTagIds: [],
    tasks: [],
    pendingUpdates: null,
    loading: false,

    setLoading : (loading) => set({ loading }),

    setSection: (section) => set({ section }),

    updateCurrentTask: <K extends keyof Task>(key: K, value: Task[K]) => 
      set((state) => {
        if (state.currentTask) {
          state.currentTask[key] = value;
        }
      }),

      fetchTaskPreviews: async (pageParam: number) => {
        const setLoading = useTasks.getState().setLoading;
        const fetchedTasks = await tasksApi.getTaskPreviews(pageParam);
        if (fetchedTasks) { 
          set({ tasks: fetchedTasks.data })
        }
      },

    fetchTask : async (noteId:number) => {
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
          state.currentTask.subtasks.push({ subtask_id: state.currentTask.subtasks.length + 1, description: '', completed: false });
        }
      }),

    handleRemoveSubtask: (subtaskId) => 
      set((state) => {
        if (state.currentTask) {
          state.currentTask.subtasks = state.currentTask.subtasks.filter((subtask) => subtask.subtask_id !== subtaskId);
        }
      }),

    handleSaveTask: async () => {
      const { currentTask } = get();
      const {selectedTagIds} = useTags.getState();

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
            state.tasks.push(currentTask)
            state.currentTask = null;
            state.section = 'all tasks';
          });
        }
      }
    },

    handleEditTask: async () => {
      const { currentTask } = get();
      const { tags, selectedTagIds } = useTags.getState();

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
            state.pendingUpdates = updatedTask;
          });

        const response = await tasksApi.update(updatedTask);
        if (!response) {
          // revert update
          set({ tasks: previousTasks, pendingUpdates: null });
        }

        set((state) => {
          state.currentTask = null;
          state.section = 'all tasks';
        });
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
              subtask.subtask_id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
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
