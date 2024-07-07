import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import tasksApi from '../../api/tasksApi';
import { Subtask, TaskPreview } from '../../api/types/taskTypes';
import { Tag } from '../../api/types/tagTypes';
import { useTags } from '../Tags/useTags';
import { useNavigate } from 'react-router-dom';

type TaskState = {
  section: string;
  currentTask: TaskPreview | null;
  tasks: TaskPreview[];
  pendingUpdates: Partial<TaskPreview> | null;
  setSection: (section: string) => void;
  updateCurrentTask: (key: keyof TaskPreview, value: any) => void;
  fetchTasks: () => Promise<void>;
  handleAddSubtask: () => void;
  handleRemoveSubtask: (subtaskId: number) => void;
  handleSaveTask: () => Promise<void>;
  handleEditTask: () => Promise<void>;
  handleDeleteTask: (taskId: number | undefined, noteId: number | undefined) => Promise<void>;
  toggleTaskCompleted: (taskId: number) => Promise<void>;
  toggleSubtaskCompleted: (subtaskId: number, taskId: number) => Promise<void>;
  setCurrentTask: (task: TaskPreview) => void;
};

export const useTasks = create<TaskState>()(
  immer((set, get) => ({
    section: 'all tasks',
    currentTask: null,
    selectedTagIds: [],
    tasks: [],
    pendingUpdates: null,

    setSection: (section) => set({ section }),

    updateCurrentTask: (key, value) => 
      set((state) => {
        if (state.currentTask) {
          state.currentTask[key] = value;
        }
      }),

    fetchTasks: async () => {
      const fetchedTasks = await tasksApi.getAll();
      if (fetchedTasks) {
        set({ tasks: fetchedTasks.data });
      }
    },

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
        const {title, content, subtasks, due_date } = currentTask;
        const response = await tasksApi.create(title, selectedTagIds, content, subtasks, due_date ? due_date.toISOString() : undefined);

        // if (response) {
        //   set((state) => {
        //     state.currentTask = null;
        //     state.section = 'all tasks';
        //   });
        // }
      }
    },

    handleEditTask: async () => {
      const { currentTask } = get();
      const { tags, selectedTagIds } = useTags.getState();

      
      if (currentTask) {
        console.log(currentTask)
        const { taskid, noteid, title, content, subtasks, due_date } = currentTask;
        const filteredTags = tags.filter((tag) => selectedTagIds.includes(tag.tag_id));

        const updatedTask: TaskPreview = {
          ...currentTask,
          title,
          tags: filteredTags,
          content,
          subtasks,
          due_date,
        };

        set((state) => {
          state.tasks = state.tasks.map((task) => (task.taskid === taskid ? updatedTask : task));
          state.pendingUpdates = updatedTask;
        });

        await tasksApi.update(updatedTask);
        set((state) => {
          state.pendingUpdates = null;
          state.currentTask = null;
          state.section = 'all tasks';
        });
      }
    },

    handleDeleteTask: async (taskId, noteId) => {
      if (taskId && noteId) {
        await tasksApi.delete(taskId, noteId);
        set((state) => {
          state.tasks = state.tasks.filter((task) => task.taskid !== taskId);
          state.section = 'all tasks';
        });
      }
    },

    toggleTaskCompleted: async (taskId) => {
      set((state) => {
        state.tasks = state.tasks.map((task) => 
          task.taskid === taskId ? { ...task, completed: !task.completed } : task
        );
      });
      await tasksApi.toggleCompleteness(taskId, null);
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
        useTags.getState().selectedTagIds = task.tags.map((tag) => tag.tag_id);
      }),
  }))
);
