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
import utilsApi from "../../api/utilsApi";

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

    fetchHabitPreviews: () => Promise<HabitPreviewResponse | null>;
    fetchHabit: (noteId: string) => Promise<HabitResponse | null>;

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
            const {setLoading} = get()
            setLoading(true)
            const response = await habitsApi.getHabitPreviews();
            if (response) {
                set((state) => {
                    state.habitPreviews = response.data;
                });
            }
            setLoading(false)
            return response;
        },

        fetchHabit: async (noteId: string) => {
            const {setLoading} = get()
            setLoading(true)
            const response = await habitsApi.getHabit(noteId);
            if (response && response.data) {
                set((state) => {
                    state.currentHabit = response.data;
                });
            }
            setLoading(false)
            return response;
        },

        handleCreateHabit: async () => {
            const { currentHabit, resetCurrentHabit, setLoading } = get();
            const { selectedTagIds } = useTags.getState();
            setLoading(true)

            if (currentHabit) {
                const { title, content, reminder } = currentHabit;
                const response = await habitsApi.create(title, selectedTagIds, content, reminder);

                if (response) {
                    set((state) => {
                        state.habitPreviews.push({
                            habitid: response.data.habitid,
                            noteid: response.data.noteid,
                            title,
                            content,
                            streak: 0,
                            completed_today: false,
                            tags: [],
                            
                        });
                        state.section = 'all habits';
                    });

                    
                }
            }
            setLoading(false)
        },

        handleUpdateHabit: async () => {
            const { currentHabit} = get();
            const { selectedTagIds } = useTags.getState();


            if (currentHabit) {
                const { habitid, noteid, title, content, reminder, streak, completed_today,tags } = currentHabit;
                const updatedHabit = {
                    habitid,
                    noteid,
                    title,
                    content,
                    reminder,
                    tags: selectedTagIds,
                    streak,
                    completed_today,
                };

                const previousHabits = get().habitPreviews;
                set((state) => {
                    state.habitPreviews = state.habitPreviews.map((habit) =>
                        habit.habitid === habitid ? { habitid,noteid,title,streak,completed_today,tags,content } : habit
                    );
                    state.currentHabit = {...currentHabit,isNew:false}
                    state.pendingChanges = false;
                });

                const response = await habitsApi.update(updatedHabit);
                if (!response) {
                    set({ habitPreviews: previousHabits,
                        currentHabit: {...currentHabit,isNew:true},
                        pendingChanges: true
                     });
            }
          }
        },

        handleDeleteHabit: async (habitid: UUID, noteid: UUID) => {
            const previousHabits = get().habitPreviews;
            set((state) => {
                state.habitPreviews = state.habitPreviews.filter((habit) => habit.habitid !== habitid);
            });
            const response = await habitsApi.delete(habitid, noteid);
            if (!response) {
                set({ habitPreviews: previousHabits });
            }
        },

        toggleCompletedToday: async (habitId: UUID) => {
            set((state) => {
                state.habitPreviews = state.habitPreviews.map((habit) =>
                    habit.habitid === habitId ? { ...habit, completed_today: !habit.completed_today, streak: (habit.streak+1) } : habit
                );
                state.currentHabit = state.currentHabit ? { ...state.currentHabit, completed_today: !state.currentHabit.completed_today } : state.currentHabit;
            });
            const response = await habitsApi.setCompleted(habitId);
            if (!response) {
                set((state) => {
                    state.habitPreviews = state.habitPreviews.map((habit) =>
                        habit.habitid === habitId ? { ...habit, completed_today: !habit.completed_today, streak: (habit.streak-1) } : habit
                    );
                    state.currentHabit = state.currentHabit ? { ...state.currentHabit, completed_today: !state.currentHabit.completed_today } : state.currentHabit;
                });
            }
        },

        toggleLinkTask: async (task) => {
            const { currentHabit } = get();
            if (currentHabit) {
                const isLinked = currentHabit.linked_tasks.some((linkedTask) => linkedTask.taskid === task.taskid);
                const originalLinkedTasks = [...currentHabit.linked_tasks];

                set((state) => {
                    if (isLinked) {
                        state.currentHabit!.linked_tasks = state.currentHabit!.linked_tasks.filter((linkedTask) => linkedTask.taskid !== task.taskid);
                    } else {
                        state.currentHabit!.linked_tasks.push(task);
                    }
                });

                try {
                    const response = await habitsApi.linkTask(currentHabit.habitid, task.taskid, isLinked ? 'unlink' : 'link');
                    if (!response) {
                        set((state) => {
                            state.currentHabit!.linked_tasks = originalLinkedTasks;
                        });
                    } else {
                        const linked_tasks = currentHabit.linked_tasks
                        useTasks.setState((state) => ({
                            ...state,
                            tasks: linked_tasks
                          }));
                    }
                } catch (error) {
                    set((state) => {
                        state.currentHabit!.linked_tasks = originalLinkedTasks;
                    });
                }
            }
        }
    }))
);
