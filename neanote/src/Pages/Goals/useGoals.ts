import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { Goal, GoalResponse, GoalsPreview } from "../../api/types/goalTypes";
import { v4 as uuidv4 } from 'uuid';
import { useTags } from "../Tags/useTags";
import goalsApi from "../../api/goalsApi";

type GoalState = {
    goalPreviews: Goal[];

    currentGoal: Goal;
    resetCurrentGoal: () => void;
    updateCurrentGoal: <K extends keyof Goal>(key: K, value: Goal[K]) => void;
    handleCreateGoal: () => Promise<void>;
    handleUpdateGoal: () => Promise<void>;
    fetchGoalPreviews: (pageParam: number) => Promise<void>;
    fetchGoal: (noteId: number) => Promise<false | GoalResponse>;

    handleAddMilestone: () => void
    handleRemoveMilestone: (milestoneid) => void
    handleMilestoneCompletion: (goalid:number, milestoneid:number) => Promise<void>

    section:string
    setSection: (section: string) => void;

    loading:boolean;
    setLoading: (loading: boolean) => void;
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
        section: "all goals",

        loading: false,
        setLoading: (loading) => set({loading}),

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
                    { milestoneid: uuidv4(), description: '', completed: false, index: 0, goalid: -1 },
                    { milestoneid: uuidv4(), description: '', completed: false, index:1, goalid: -1 }
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
            const { currentGoal, resetCurrentGoal } = get();
            const { tags, selectedTagIds } = useTags.getState();
      
            if (currentGoal) {

              const { goalid, noteid, title, content, due_date, milestones } = currentGoal;
      
              const updatedGoal = {
                goalid,
                noteid,

                title,
                tags: selectedTagIds, 
                content,
                due_date : due_date,
                milestones
              };
      
              const previousGoals = get().goalPreviews;
      
              // optimistic update
              set((state) => {
                  state.goalPreviews = state.goalPreviews.map((goal) => (goal.goalid === goalid ? {goalid, noteid, title, tags, due_date, milestones, content} : goal));
                });
      
              const response = await goalsApi.update(updatedGoal);
              if (!response) {
                // revert update
                set({ goalPreviews: previousGoals});
              }
      
              set((state) => {
                state.section = 'all goals';
              });
              resetCurrentGoal
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
                    index: milestones.length,
                    goalid: -1
                });
                milestones.forEach((ms, idx) => ms.index = idx);
              }
            }),

            fetchGoalPreviews: async (pageParam: number) => {
              const fetchedGoals = await goalsApi.get_previews(pageParam);
              if (fetchedGoals && fetchedGoals.data) {
                
                const previewsWithFormattedDates = fetchedGoals.data.map(preview => ({
                  ...preview,
                  due_date: preview.due_date ? new Date(preview.due_date) : undefined, 
                }));
                set({ goalPreviews: previewsWithFormattedDates });
              }
            },

            fetchGoal: async(noteId:number) => {
              const response = await goalsApi.getGoal(noteId);
              if (response && response.goal) {
                const dueDate = response.goal.due_date ? new Date(response.goal.due_date) : undefined;
                const goalWithFormattedDate = {
                  ...response.goal,
                  due_date: dueDate,
                };
                set((state) => {
                  state.currentGoal = goalWithFormattedDate;

                });
              }
              return response
            },
        
        handleRemoveMilestone: (milestoneid) => {
                set((state) => {

                    if (state.currentGoal) {
                        const milestones = state.currentGoal.milestones.filter((milestone) => milestone.milestoneid !== milestoneid);
                        milestones.forEach((ms, idx) => ms.index = idx);
                        state.currentGoal.milestones = milestones;
                    }
                })
            },
        
        handleMilestoneCompletion: async (goalid, milestoneid) => {
              set((state) => {
                state.goalPreviews = state.goalPreviews.map((goal) => {
                  if (goal.goalid === goalid) {
                    const newMilestones = goal.milestones.map((milestone) => 
                      milestone.milestoneid === milestoneid ? { ...milestone, completed: !milestone.completed } : milestone
                    );
                    return { ...goal, milestones: newMilestones };
                  }
                  return goal;
                });
              });
              await goalsApi.completeMilestone(goalid, milestoneid);
            },

        updateCurrentGoal: <K extends keyof Goal>(key: K, value: Goal[K]) => 
            set((state) => {
              if (state.currentGoal) {
                state.currentGoal[key] = value;
              }
            }),
        
            


    })))