import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { Habit,HabitPreview,  HabitPreviewResponse,  HabitResponse } from "../../api/types/habitTypes";
import { useTags } from "../Tags/useTags";
import habitsApi from "../../api/habitsApi";
import { TaskPreview } from "../../api/types/taskTypes";

type HabitState = {
    habitPreviews: HabitPreview[];
    pendingUpdates: Partial<Habit> | null;
    currentHabit: Habit | null;
    setCurrentHabit: (habit: Habit) => void;
    updateCurrentHabit: <K extends keyof Habit>(key: K, value: Habit[K]) => void;
    section: string
    setSection: (section: string) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    setCompleted: (habitid: number) => void;

    fetchHabitPreviews: ()=> Promise<HabitPreviewResponse | false>;
    fetchHabit: (habitId: number, noteId: number) => Promise<HabitResponse | false>;
    handleCreateHabit: () => void;
    handleUpdateHabit: () => void;
    handleDelete: () => void;
    toggleLinkTask: (task: TaskPreview) => void;
}

export const useHabits = create<HabitState>()(
    immer((set, get) => ({
        habitPreviews: [],
        currentHabit: null,
        loading:false,
        section: "all habits",
        pendingUpdates: null,

        setCurrentHabit: (habit) => {
            set((state) => {
                state.currentHabit = { ...habit };
                useTags.getState().selectedTagIds = habit.tags.map((tag) => tag.tagid);
              })
            },
        
        updateCurrentHabit: <K extends keyof Habit>(key: K, value: Habit[K]) => 
            set((state) => {
                  if (state.currentHabit) {
                    state.currentHabit[key] = value;
                }
            }),

        setSection: (section) => set({section}),
        setLoading: (loading) => set({loading}),

        handleDelete:async () => {
            const { currentHabit } = get();
            if (currentHabit) {
              const response = await habitsApi.delete(currentHabit.habitid, currentHabit.noteid );
              if (response) {
                set((state) => {
                  state.habitPreviews = state.habitPreviews.filter((habit) => habit.habitid !== currentHabit.habitid);
                  state.currentHabit = null;
                  state.section = 'all habits';
                });
              }
            }
        },

        handleCreateHabit: async () => {
            const { currentHabit } = get();
            const {selectedTagIds} = useTags.getState();
      
            if (currentHabit) {
              
              const {title, content, reminder} = currentHabit;
              
              const response = await habitsApi.create(title, selectedTagIds, content, reminder);
      
              if (response) {
                set((state) => {
                  state.habitPreviews.push({habitid: response.data.habitid, noteid: response.data.noteid, title, content, streak: 0, completed_today: false, tags: []});
                  state.currentHabit = null;
                  state.section = 'all habits';
                });
              }
            }
          },

          handleUpdateHabit: async () => {
            const { currentHabit } = get();
            const { tags, selectedTagIds } = useTags.getState();
      
            if (currentHabit) {

              const { habitid, noteid, title, content, streak, reminder, completed_today } = currentHabit;
              const filteredTags = tags.filter((tag) => selectedTagIds.includes(tag.tagid));
      
              const updatedHabit: Habit = {
                ...currentHabit,
                title,
                tags: filteredTags,
                streak,
                content,
                reminder,
              };
      
              const previousHabits = get().habitPreviews;
      
              // optimistic update
              set((state) => {
                  state.habitPreviews = state.habitPreviews.map((habit) => (habit.habitid === habitid ? {habitid, noteid, title, tags, streak, content, completed_today} : habit));
                  state.pendingUpdates = updatedHabit;
                });
      
              const response = await habitsApi.update(updatedHabit);
              if (!response) {
                // revert update
                set({ habitPreviews: previousHabits, pendingUpdates: null });
              }
      
              set((state) => {
                state.currentHabit = null;
                state.section = 'all habits';
              });
            }

          },

          setCompleted: async (habitId) => {
            set((state) => {
              state.habitPreviews = state.habitPreviews.map((habit) => 
                habit.habitid === habitId ? { ...habit, completed_today: true } : habit
              );
            });
            const response = await habitsApi.setCompleted(habitId);
      
            // Revert the state if the API call fails
            if (!response) {
              set((state) => {
                state.habitPreviews = state.habitPreviews.map((habit) => 
                 habit.habitid ===habitId ? { ...habit, completed_today: false } :habit
                );
              });
            }
          },
        
          fetchHabitPreviews: async () => {
            const response = await habitsApi.getHabitPreviews(); //implement pagination
            console.log(response)
            if (response) {
              set((state) => {
                state.habitPreviews = response.data;
              });
            }
            return response;
          },

          fetchHabit : async (habitId: number, noteId:number) => {
            const response = await habitsApi.getHabit(habitId, noteId);
            if (response) {
              set((state) => {
                state.currentHabit = response.data;
              });
            }
            return response
          }
          ,

          toggleLinkTask: async (task) => {
            const { currentHabit } = get();
            console.log("clicked")
            if (currentHabit) {
              const isLinked = currentHabit.linked_tasks.some((linkedTask) => linkedTask.taskid === task.taskid);
              // Store a copy of the original linked tasks for potential rollback
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
              } catch (error) {
                // Rollback to the original state in case of an error
                set((state) => {
                  state.currentHabit!.linked_tasks = originalLinkedTasks;
                });
              }
            }
          }
      
    }),
))