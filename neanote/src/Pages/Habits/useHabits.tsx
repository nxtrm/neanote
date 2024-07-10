import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { Habit } from "../../api/types/habitTypes";
import { useTags } from "../Tags/useTags";
import habitsApi from "../../api/habitsApi";

type HabitState = {
    habits: Habit[];
    currentHabit: Habit | null;
    setCurrentHabit: (habit: Habit) => void;
    updateCurrentHabit: <K extends keyof Habit>(key: K, value: Habit[K]) => void;
    section: string
    setSection: (section: string) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;

    handleCreateHabit: () => void;
}

export const useHabits = create<HabitState>()(
    immer((set, get) => ({
        habits: [],
        currentHabit: null,
        loading:false,
        section: "all habits",

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

        handleCreateHabit: async () => {
            const { currentHabit } = get();
            const {selectedTagIds} = useTags.getState();
      
            if (currentHabit) {
              
              const {title, content, reminder} = currentHabit;
              const response = await habitsApi.create(title, selectedTagIds, content, reminder);
      
              if (response) {
                set((state) => {
                  state.habits.push(currentHabit)
                  state.currentHabit = null;
                  state.section = 'all habits';
                });
              }
            }
          },
      
    }),
))