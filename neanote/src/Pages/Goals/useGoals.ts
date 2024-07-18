import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { Goal } from "../../api/types/goalTypes";

type GoalState = {
    goalPreviews: Goal[];

    currentGoal: Goal | null;
    setCurrentGoal: (goal: Goal) => void;
    updateCurrentGoal: <K extends keyof Goal>(key: K, value: Goal[K]) => void;
    
    handleAddMilestone: () => void
    handleRemoveMilestone: (milestoneid) => void

    section:string
    setSection: (section: string) => void;
}

export const useGoals = create<GoalState>()(
    immer((set, get) => ({
        goalPreviews: [],
        currentGoal: null,
        // loading:false,
        section: "all goals",

        setSection: (section) => set({section}),

        setCurrentGoal: (goal) => {
            set((state) => {
                state.currentGoal = { ...goal };
            })
        },

        handleAddMilestone: () => 
            set((state) => {
              if (state.currentGoal) {
                state.currentGoal.milestones.push({ milestoneid: state.currentGoal.milestones.length + 1, description: '', completed: false, index: state.currentGoal.milestones.length + 1 });
              }
            }),
        
        handleRemoveMilestone: (milestoneid) => {
            set((state) => {
                if (state.currentGoal) {
                    state.currentGoal.milestones = state.currentGoal.milestones.filter((milestone) => milestone.milestoneid !== milestoneid);
                }
            })
        },

        updateCurrentGoal: <K extends keyof Goal>(key: K, value: Goal[K]) => 
            set((state) => {
              if (state.currentGoal) {
                state.currentGoal[key] = value;
              }
            }),


    })))