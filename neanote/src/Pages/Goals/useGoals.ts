import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { Goal } from "../../api/types/goalTypes";
import { v4 as uuidv4 } from 'uuid';
import { useTags } from "../Tags/useTags";

type GoalState = {
    goalPreviews: Goal[];

    currentGoal: Goal;
    resetCurrentGoal: () => void;
    updateCurrentGoal: <K extends keyof Goal>(key: K, value: Goal[K]) => void;
    handleCreateGoal: () => Promise<void>;
    handleUpdateGoal: () => Promise<void>;

    handleAddMilestone: () => void
    handleRemoveMilestone: (milestoneid) => void

    section:string
    setSection: (section: string) => void;
}

export const useGoals = create<GoalState>()(
    immer((set, get) => ({
        goalPreviews: [],
        currentGoal: {
            goalid: -1,
            noteid: -1,
            title: '',
            content: '',
            due_date: undefined,
            milestones: [
            ],
            tags: [],
          },
          
        // loading:false,
        section: "all goals",

        setSection: (section) => set({section}),

        resetCurrentGoal: () => {
            set((state) => {
                state.currentGoal = {             
                    goalid: -1,
                    noteid: -1,
                    title: '',
                    content: '',
                    due_date: undefined,
                    tags: [], 
                    milestones: [
                    { milestoneid: uuidv4(), description: '', completed: false, index: 0 },
                    { milestoneid: uuidv4(), description: '', completed: false, index:1 }
                ]};
            })
        },

        handleCreateGoal: async () => {
            const { currentGoal, resetCurrentGoal } = get();
            const { selectedTagIds } = useTags.getState();
      
            if (currentGoal) {
              
              const {title, content, due_date, milestones} = currentGoal;
              
              const response = await goalsApi.create(title, selectedTagIds, content, due_date, milestones);
      
              if (response) {
                set((state) => {
                //   state.goalPreviews.push({goalid: response.data.goalid, noteid: response.data.noteid, title, content, milestones, due_date, tags: []});
                  state.section = 'all goals';
                });
                resetCurrentGoal
              }
            }
          },

          handleUpdateGoal: async () => {
            const { currentGoal } = get();
            const { tags, selectedTagIds } = useTags.getState();
      
            if (currentGoal) {

              const { habitid, noteid, title, content, streak, reminder, completed_today } = currentGoal;
              const filteredTags = tags.filter((tag) => selectedTagIds.includes(tag.tagid));
      
              const updatedGoal: Partial<Goal> = {
                habitid,
                noteid,

                title,
                tags: filteredTags,
                streak,
                content,
                reminder,
                completed_today
              };
      
              const previousGoals = get().habitPreviews;
      
              // optimistic update
              set((state) => {
                  state.habitPreviews = state.habitPreviews.map((habit) => (habit.habitid === habitid ? {habitid, noteid, title, tags, streak, content, completed_today} : habit));
                  state.pendingUpdates = updatedGoal;
                });
      
              const response = await habitsApi.update(updatedGoal);
              if (!response) {
                // revert update
                set({ habitPreviews: previousGoals, pendingUpdates: null });
              }
      
              set((state) => {
                state.currentGoal = null;
                state.section = 'all habits';
              });
            }

          },

        handleAddMilestone: () => 
            set((state) => {
              if (state.currentGoal) {
                const milestones = state.currentGoal.milestones;
                milestones.splice(milestones.length - 1, 0, { 
                    milestoneid: uuidv4(), 
                    description: '', 
                    completed: false, 
                    index: milestones.length 
                });
                milestones.forEach((ms, idx) => ms.index = idx);
              }
            }),
        
            handleRemoveMilestone: (milestoneid) => {
                set((state) => {
                    if (state.currentGoal) {
                        const milestones = state.currentGoal.milestones.filter((milestone) => milestone.milestoneid !== milestoneid);
                        milestones.forEach((ms, idx) => ms.index = idx);
                        state.currentGoal.milestones = milestones;
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