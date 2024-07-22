import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { Goal, GoalResponse, GoalsPreview } from "../../api/types/goalTypes";
import { v4 as uuidv4 } from 'uuid';
import { useTags } from "../Tags/useTags";
import goalsApi from "../../api/goalsApi";
import { UUID } from "crypto";

// Function to generate a new current goal object
const generateNewCurrentGoal = () => {

  return {
    goalid: uuidv4(),
    noteid: uuidv4(),
    title: '',
    content: '',
    due_date: undefined,
    tags: [],
    milestones: [
      { milestoneid: uuidv4(), description: '', completed: false, index: 0, },
      { milestoneid: uuidv4(), description: '', completed: false, index: 1, }
    ]
  };
};

type GoalState = {
    goalPreviews: Goal[];

    currentGoal: Goal;

    resetCurrentGoal: () => void;
    updateCurrentGoal: <K extends keyof Goal>(key: K, value: Goal[K]) => void;
    handleCreateGoal: () => Promise<void>;
    handleUpdateGoal: () => Promise<void>;
    handleDeleteGoal: (goalid: UUID, noteid: UUID) => Promise<void>;
    fetchGoalPreviews: (pageParam: number) => Promise<void>;
    fetchGoal: (noteId: UUID) => Promise<null | GoalResponse>;

    handleAddMilestone: () => void
    handleRemoveMilestone: (milestoneid:UUID) => void
    handleMilestoneCompletion: (goalid:UUID, milestoneid:UUID) => Promise<void>

    section:string
    setSection: (section: string) => void;

    loading:boolean;
    setLoading: (loading: boolean) => void;
}

export const useGoals = create<GoalState>()(
    immer((set, get) => ({
        goalPreviews: [],
        
        
        section: "all goals",
        
        loading: false,
        setLoading: (loading) => set({loading}),
        
        setSection: (section) => set({section}),
        
        resetCurrentGoal: () => {
          set(() => ({
            currentGoal: generateNewCurrentGoal()
          }));
        },
              
        currentGoal: generateNewCurrentGoal(),
              
        handleCreateGoal: async () => {
            const { currentGoal, resetCurrentGoal,setLoading } = get();
            const { selectedTagIds } = useTags.getState();
            setLoading(true)
      
            if (currentGoal) {
              
              const {title, content, due_date, milestones} = currentGoal;
              
              const response = await goalsApi.create(title, selectedTagIds, content, due_date, milestones);
      
              if (response) {
                set((state) => {
                  state.goalPreviews.push({
                    goalid : response.data.goalid,
                    noteid : response.data.noteid,
                    title,
                    content,
                    due_date,
                    milestones : response.data.milestones,
                    tags: [],
                  });
                  state.section = 'edit goal';
                });
                // resetCurrentGoal();

                setLoading(false)
            }}
          },

          handleUpdateGoal: async () => {
            const { currentGoal, resetCurrentGoal, setLoading } = get();
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
                  });
                  milestones.forEach((ms, idx) => ms.index = idx);
                }
              }),

          fetchGoalPreviews: async (pageParam: number) => {
              useGoals.getState().setLoading(true);
              const fetchedGoals = await goalsApi.get_previews(pageParam);
              if (fetchedGoals && fetchedGoals.data) {
                
                const previewsWithFormattedDates = fetchedGoals.data.map(preview => ({
                  ...preview,
                  due_date: preview.due_date ? new Date(preview.due_date) : undefined, 
                }));
                set({ goalPreviews: previewsWithFormattedDates });
              }
              useGoals.getState().setLoading(false);
            },

          fetchGoal: async(noteId:UUID) => {
              useGoals.getState().setLoading(true);
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
              useGoals.getState().setLoading(false);
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
              const toggleMilestoneCompletion = (goalid, milestoneid) => {
                set((state) => {
                  // state.goalPreviews = state.goalPreviews.map((goal) => {
                  //   if (goal.goalid === goalid) {
                  //     const newMilestones = goal.milestones.map((milestone) => 
                  //       milestone.milestoneid === milestoneid ? { ...milestone, completed: !milestone.completed } : milestone
                  //     );
                  //     return { ...goal, milestones: newMilestones };
                  //   }
                  //   return goal;
                  // });
                  state.currentGoal = {...state.currentGoal, milestones:  state.currentGoal.milestones.map((milestone) => 
                    milestone.milestoneid === milestoneid ? { ...milestone, completed: !milestone.completed } : milestone
                )
                }
              })}
            
              // Toggle completion before API call
              toggleMilestoneCompletion(goalid, milestoneid);
            
              const response = await goalsApi.completeMilestone(goalid, milestoneid);
              if (!response) {
                // Revert completion if API call fails
                toggleMilestoneCompletion(goalid, milestoneid);
              }
            },

        updateCurrentGoal: <K extends keyof Goal>(key: K, value: Goal[K]) => 
            set((state) => {
              if (state.currentGoal) {
                state.currentGoal[key] = value;
              }
            }),

        
        handleDeleteGoal: async (goalid, noteid) => {
              const previousGoals = get().goalPreviews;
              set((state) => {
                state.goalPreviews = state.goalPreviews.filter((goal) => goal.goalid !== goalid);
              });
              const response = await goalsApi.delete(goalid, noteid);
              if (!response) {
                // revert deletion
                set({ goalPreviews: previousGoals });
            }},

    })))