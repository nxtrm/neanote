import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { Habit } from "../../api/types/habitTypes";
import { useTags } from "../Tags/useTags";

type HabitState = {
    habits: Habit[];
    currentHabit: Habit | null;
    setCurrentHabit: (habit: Habit) => void;
    section: string
    setSection: (section: string) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
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

        setSection: (section) => set({section}),
        setLoading: (loading) => set({loading}),
    }),
))