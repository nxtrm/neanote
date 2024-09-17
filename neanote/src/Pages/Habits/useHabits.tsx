import { UUID } from "crypto";
import { v4 as uuidv4 } from 'uuid';
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { showToast } from "../../../components/Toast";
import utilsApi from "../../api/archiveApi";
import habitsApi from "../../api/habitsApi";
import { Habit, HabitPreview } from "../../api/types/habitTypes";
import { Task } from "../../api/types/taskTypes";
import { HabitSchema } from "../../formValidation";
import { useTags } from "../Tags/useTags";

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
    nextPage: number | null;
    page: number

    loading: boolean;
    setLoading: (loading: boolean) => void;

    updateCurrentHabit: <K extends keyof Habit>(key: K, value: Habit[K]) => void;
    resetCurrentHabit: () => void;

    fetchHabitPreviews: (pageParam:number) => Promise<void>;
    fetchHabit: (noteId: string) => Promise<void>;

    handleCreateHabit: () => Promise<boolean>;
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
        nextPage: null,
        page: 1,
        habitPreviews: [],
        currentHabit: generateNewHabit(),
        loading: false,
        validationErrors:{},
        pendingChanges: false,


        setPendingChanges : (pendingChanges) => set({pendingChanges}),
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
            if (response && response.success) {
              set((state) => {
                state.habitPreviews = state.habitPreviews.filter((habit) => habit.noteid !== noteId);
              });
              showToast('success', 'Habit archived successfully');
            } else {
              showToast('error', response.message);
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

        fetchHabitPreviews: async (pageParam:number) => {
            const { setLoading } = get();
            setLoading(true);
            const response = await habitsApi.getHabitPreviews(pageParam);
            if (response.success && response.data) {
                set((state) => {
                    state.habitPreviews = response.data.data;
                    state.page = response.page
                    state.nextPage = response.nextPage;
                });
            } else {
                showToast('error', response.message);
            }
            setLoading(false);
        },

        fetchHabit: async (noteId: string) => {
            const { setLoading } = get();
            const {setSelectedTagIds} = useTags.getState();
            setLoading(true);
            const response = await habitsApi.getHabit(noteId);
            if (response.success && response.data) {
                set((state) => {
                    state.currentHabit = response.data.data;
                });
                setSelectedTagIds(response.data.data.tags);
            } else {
                showToast('error', response.message);
            }
            setLoading(false);
        },

        handleCreateHabit: async () => {
            const { currentHabit, setLoading } = get();
            setLoading(true);
            get().validateHabit()
            if (get().validateHabit()) {
                const response = await habitsApi.create(currentHabit.title, currentHabit.tags, currentHabit.content, currentHabit.reminder);
                if (response.success && response.data) {
                    set((state) => {
                        state.currentHabit = { ...currentHabit, habitid: response.data.habitid, noteid: response.data.noteid };
                        state.habitPreviews.push({
                            ...currentHabit,
                            habitid: response.data.habitid,
                            noteid: response.data.noteid,
                        })
                    });
                    setLoading(false);
                    localStorage.setItem('currentHabitId', response.data.noteid.toString());
                    showToast('success', response.message);
                    return true
                } else {
                    showToast('error', response.message);
                }
            } else {
                showToast('error', 'Validation failed');
            }
            setLoading(false);
        return false
        },


        handleUpdateHabit: async () => {
            const { currentHabit} = get();
            const { selectedTagIds } = useTags.getState();
            try {
              if (get().validateHabit()) {
                const updatedHabit = { ...currentHabit, tags: selectedTagIds };
                const response = await habitsApi.update(updatedHabit);
      
              if (response && response.success) {
                set((state) => {
                  state.habitPreviews = state.habitPreviews.map((habit) => (habit.habitid === currentHabit.habitid ? currentHabit : habit));
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
                        if (response.streak == "+") {
                            habit.streak = habit.streak + 1 
                        } else if (response.streak == 1) {
                            habit.streak = 1
                        }
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
