import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { Habit, HabitPreview, HabitPreviewResponse, HabitResponse } from "../../api/types/habitTypes";
import { useTags } from "../Tags/useTags";
import habitsApi from "../../api/habitsApi";
import { v4 as uuidv4 } from 'uuid';
import { Task } from "../../api/types/taskTypes";
import { UUID } from "crypto";
import { HabitSchema } from "../../formValidation";
import { useTasks } from "../Tasks/useTasks";
import utilsApi from "../../api/archiveApi";
import { showToast } from "../../../components/Toast";
import { current } from "immer";

// Function to generate a new habit object
const generateNewHabit = () => ({
    habitid: uuidv4(),
    noteid: uuidv4(),
    title: '',
    content: '',
    reminder: {
      reminder_time: '',
      repetition: 'daily',
    },
    tags: [],
    streak: 0,
    completed_today: false,
    linked_tasks: [],
    isNew: true,
});

type HabitState = {
    habitPreviews: HabitPreview[];
    currentHabit: Habit;

    loading: boolean;
    setLoading: (loading: boolean) => void;

    section: string;
    setSection: (section: string) => void;

    updateCurrentHabit: <K extends keyof Habit>(key: K, value: Habit[K]) => void;
    resetCurrentHabit: () => void;

    fetchHabitPreviews: () => Promise<void>;
    fetchHabit: (noteId: string) => Promise<void>;

    handleCreateHabit: () => Promise<void>;
    handleUpdateHabit: () => Promise<void>;
    handleDeleteHabit: (habitid: UUID, noteid: UUID) => Promise<void>;
    archive: (noteId: UUID) => Promise<void>;

    toggleCompletedToday: (habitId: UUID) => Promise<void>;
    toggleLinkTask: (task: Task) => Promise<void>;

    validationErrors: Record<string, string | undefined>;
    validateHabit: () => boolean;

    pendingChanges: boolean;
    setPendingChanges: (pendingChanges: boolean) => void;
}

export const useHabits = create<HabitState>()(
    immer((set, get) => ({
        habitPreviews: [],
        currentHabit: generateNewHabit(),
        loading: false,
        section: "all habits",
        validationErrors:{},
        pendingChanges: false,


        setPendingChanges : (pendingChanges) => set({pendingChanges}),
        setSection: (section) => set({ section }),
        setLoading: (loading) => set({ loading }),

        validateHabit: () => {
          const { currentHabit } = get();
          const result = HabitSchema.safeParse(currentHabit);
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
        archive: async (noteId: UUID) => {
            const response = await utilsApi.archive(noteId);
            if (response) {
              set((state) => {
                state.habitPreviews = state.habitPreviews.filter((habit) => habit.noteid !== noteId);
              });
              //set archived habits
            }
          },

        updateCurrentHabit: <K extends keyof Habit>(key: K, value: Habit[K]) => {
            set((state) => {
                if (state.currentHabit) {
                    state.currentHabit[key] = value;
                }
                if (!state.pendingChanges) {
                    state.pendingChanges = true;
                  }
            });
            get().validateHabit()
        },

        resetCurrentHabit: () => {
            set({ currentHabit: generateNewHabit() });
        },

        fetchHabitPreviews: async () => {
            const { setLoading } = get();
            setLoading(true);
            const response = await habitsApi.getHabitPreviews();
            if (response.success && response.data) {
                set((state) => {
                    state.habitPreviews = response.data.data;
                });
            } else {
                showToast('error', response.message);
            }
            setLoading(false);
        },

        fetchHabit: async (noteId: string) => {
            const { setLoading } = get();
            setLoading(true);
            const response = await habitsApi.getHabit(noteId);
            if (response.success && response.data) {
                set((state) => {
                    state.currentHabit = response.data.data;
                });
            } else {
                showToast('error', response.message);
            }
            setLoading(false);
        },

        handleCreateHabit: async () => {
            const { currentHabit, resetCurrentHabit, setLoading } = get();
            setLoading(true);
            const response = await habitsApi.create(currentHabit.title, currentHabit.tags, currentHabit.content, currentHabit.reminder);
            if (response.success && response.data) {
                set((state) => {
                    state.habitPreviews.push({
                        ...currentHabit,
                        habitid: response.data.habitid,
                        noteid: response.data.noteid
                    });
                });
                showToast('success', response.message);
                resetCurrentHabit();
            } else {
                showToast('error', response.message);
            }
            setLoading(false);
        },

        handleUpdateHabit: async () => {
            const { currentHabit, setLoading } = get();
            setLoading(true);
            const response = await habitsApi.update(currentHabit);
            if (response.success) {
                set((state) => {
                    const index = state.habitPreviews.findIndex(habit => habit.noteid === currentHabit.noteid);
                    if (index !== -1) {
                        state.habitPreviews[index] = { ...currentHabit };
                    }
                });
                showToast('success', response.message);
            } else {
                showToast('error', response.message);
            }
            setLoading(false);
        },

        handleDeleteHabit: async (habitid: UUID, noteid: UUID) => {
            const { setLoading } = get();
            setLoading(true);
            const response = await habitsApi.delete(habitid, noteid);
            if (response.success) {
                set((state) => {
                    state.habitPreviews = state.habitPreviews.filter(habit => habit.noteid !== noteid);
                });
                showToast('success', response.message);
            } else {
                showToast('error', response.message);
            }
            setLoading(false);
        },

        toggleCompletedToday: async (habitId: UUID) => {
            const { setLoading } = get();
            setLoading(true);
            const response = await habitsApi.setCompleted(habitId);
            if (response.success) {
                set((state) => {
                    const habit = state.habitPreviews.find(habit => habit.habitid === habitId);
                    if (habit) {
                        habit.completed_today = !habit.completed_today;
                    }
                });
                showToast('success', 'Habit status updated successfully');
            } else {
                showToast('error', response.message);
            }
            setLoading(false);
        },

        toggleLinkTask: async (task: Task) => {
            const { currentHabit, setLoading } = get();
            const taskLinked = currentHabit.linked_tasks.some(t => t.taskid === task.taskid);
            const actionType = taskLinked ? 'unlink' : 'link';
            setLoading(true);
            const response = await habitsApi.linkTask(currentHabit.habitid, task.taskid, actionType);
            if (response.success) {
                set((state) => {
                    if (taskLinked) {
                        state.currentHabit.linked_tasks = state.currentHabit.linked_tasks.filter(t => t.taskid !== task.taskid);
                    } else {
                        state.currentHabit.linked_tasks.push(task);
                    }
                });
                showToast('success', `Task ${taskLinked ? 'unlinked' : 'linked'} successfully`);
            } else {
                showToast('error', response.message);
            }
            setLoading(false);
        },
    }))
);
