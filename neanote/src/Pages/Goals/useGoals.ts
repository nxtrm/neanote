import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { Goal, GoalResponse, GoalsPreview } from "../../api/types/goalTypes";
import { v4 as uuidv4 } from 'uuid';
import { useTags } from "../Tags/useTags";
import goalsApi from "../../api/goalsApi";
import { UUID } from "crypto";
import { GoalSchema } from "../../formValidation";
import utilsApi from "../../api/archiveApi";
import { showToast } from "../../../components/Toast";
import { quicksort, binarySearch } from "../../../components/utils";

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
      { milestoneid: uuidv4(), description: '', completed: false, index: 0, isNew: true },
      { milestoneid: uuidv4(), description: '', completed: false, index: 1, isNew: true }
    ]
  };
};

type GoalState = {
    goalPreviews: Goal[];

    currentGoal: Goal;

    resetCurrentGoal: () => void;
    updateCurrentGoal: <K extends keyof Goal>(key: K, value: Goal[K]) => void;
    handleCreateGoal: () => Promise<boolean>;
    handleUpdateGoal: () => Promise<void>;
    handleDeleteGoal: (goalid: UUID, noteid: UUID) => Promise<void>;
    fetchGoalPreviews: (pageParam: number) => Promise<void>;
    fetchGoal: (noteId: string) => Promise<void>

    handleAddMilestone: () => void
    handleRemoveMilestone: (milestoneid:UUID) => void
    handleMilestoneCompletion: (goalid:UUID, milestoneid:UUID) => Promise<void>
    archive: (noteId: UUID) => Promise<void>;

    loading:boolean;
    setLoading: (loading: boolean) => void;

    pendingChanges:boolean
    setPendingChanges(value: boolean): void;

    validationErrors: Record<string, string | undefined>;
    validateGoal: () => boolean;

    page:number
    nextPage:number | null
}

export const useGoals = create<GoalState>()(
    immer((set, get) => ({
        goalPreviews: [],
        validationErrors:{},
        pendingChanges: false,

        loading: false,
        setLoading: (loading) => set({loading}),
        setPendingChanges: (value) => set({pendingChanges: value}),

        page:1,
        nextPage:null,

        resetCurrentGoal: () => {
          set(() => ({
            currentGoal: generateNewCurrentGoal()
          }));
        },

        currentGoal: generateNewCurrentGoal(),

        handleCreateGoal: async () => {
          const { currentGoal } = get();
          const { selectedTagIds } = useTags.getState();
          if (get().validateGoal()) {
            const { title, content, due_date, milestones } = currentGoal;
            const response = await goalsApi.create(title, selectedTagIds, content, due_date, milestones);

            if (response.data && response.success) {
              set((state) => {
                state.currentGoal = { ...currentGoal, goalid: response.data.goalid, noteid: response.data.noteid };
                state.goalPreviews.push({
                  goalid: response.data.goalid,
                  noteid: response.data.noteid,
                  title,
                  content,
                  due_date,
                  milestones: response.data.milestones,
                  tags: [],
                });
              });
              localStorage.setItem('currentGoalId', response.data.noteid.toString());
              showToast('success', 'Goal created successfully');
              return true;
            } else {
              showToast('error', response.message);
            }
          } else {
            showToast('error', 'Validation failed');
          }
          return false;
        },

        handleUpdateGoal: async () => {
            const { currentGoal, resetCurrentGoal } = get();
            const { tags, selectedTagIds } = useTags.getState();

            if (get().validateGoal()) {
              const { goalid, noteid, title, content, due_date, milestones } = currentGoal;

              // Sort milestones by index using quicksort before sending to API
              const sortedMilestones = quicksort([...milestones], (a, b) => a.index - b.index);

              const preparedMilestones = sortedMilestones.map(milestone => {
                const { isNew, ...rest } = milestone;
                if (isNew) {
                  // For new milestones, exclude the milestoneid when sending to the backend
                  const { milestoneid, ...newMilestoneRest } = rest;
                  return newMilestoneRest;
                }
                return rest;
              });

              const updatedGoal = {
                goalid,
                noteid,
                title,
                tags: selectedTagIds,
                content,
                due_date,
                milestones: preparedMilestones,
              };

              const previousGoals = get().goalPreviews;

              // optimistic update
              set((state) => {
                  state.goalPreviews = state.goalPreviews.map((goal) => (goal.goalid === goalid ? {goalid, noteid, title, tags, due_date, milestones, content} : goal));
                });

              const response = await goalsApi.update(updatedGoal);
              if (!response || !response.success) {
                // revert update
                set({ goalPreviews: previousGoals});
              } else {
                set({pendingChanges: false })
              }

            } else {
              showToast('error', 'Validation failed');
            }

          },

        validateGoal: () => {
            const { currentGoal } = get();
            const result = GoalSchema.safeParse(currentGoal);
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


        handleAddMilestone: () =>
              set((state) => {
                if (state.currentGoal) {
                  const milestones = state.currentGoal.milestones;
                  milestones.splice(milestones.length - 1, 0, {
                      milestoneid: uuidv4(),
                      description: '',
                      completed: false,
                      index: milestones.length,
                      isNew: true,
                  });

                  // Sort milestones by index using quicksort
                  state.currentGoal.milestones = quicksort(milestones, (a, b) => a.index - b.index);

                  // Update indices
                  state.currentGoal.milestones.forEach((ms, idx) => ms.index = idx);
                }
              }),

        fetchGoalPreviews: async (pageParam: number) => {
              useGoals.getState().setLoading(true);
              const response = await goalsApi.getGoalPreviews(pageParam);
              if (response && response.data) {

                const previewsWithFormattedDates = response.data.map(preview => ({
                  ...preview,
                  due_date: preview.due_date ? new Date(preview.due_date + 'Z') : undefined,
                }));
                set({ goalPreviews: previewsWithFormattedDates, nextPage: response.nextPage, page: response.page });
              } else{
                showToast('error', response.message);
              }
              useGoals.getState().setLoading(false);
            },

        fetchGoal: async(noteId:string) => {
          const {setSelectedTagIds} = useTags.getState();
          try{
              useGoals.getState().setLoading(true);
              const response = await goalsApi.getGoal(noteId);
              if (response && response.data) {
                const dueDate = response.data.due_date ? new Date(response.data.due_date + 'Z') : undefined;
                const goalWithFormattedDate = {
                  ...response.data,
                  due_date: dueDate,
                };
                set((state) => {
                  state.currentGoal = goalWithFormattedDate;
                });
                setSelectedTagIds(response.data.tags.map(tag=>tag.tagid));
              } else {
                showToast('error', response.message);
              }
            } finally {
              set({ loading: false });
            }
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
                  state.goalPreviews = state.goalPreviews.map((goal) => {
                    if (goal.goalid === goalid) {
                      const newMilestones = goal.milestones.map((milestone) =>
                        milestone.milestoneid === milestoneid ? { ...milestone, completed: !milestone.completed } : milestone
                      );
                      return { ...goal, milestones: newMilestones };
                    }
                    return goal;
                  });

                  state.currentGoal = {...state.currentGoal, milestones:  state.currentGoal.milestones.map((milestone) =>
                    milestone.milestoneid === milestoneid ? { ...milestone, completed: !milestone.completed } : milestone
                )
                }
              })}

              // Toggle completion before API call
              toggleMilestoneCompletion(goalid, milestoneid);

              const response = await goalsApi.completeMilestone(goalid, milestoneid);
              if (!response || !response.success) {
                // Revert completion if API call fails
                toggleMilestoneCompletion(goalid, milestoneid);
              }
            },

        archive: async (noteId: UUID) => {
          const response = await utilsApi.archive(noteId);
          if (response && response.success) {
            set((state) => {
              state.goalPreviews = state.goalPreviews.filter((goal) => goal.noteid !== noteId);
            });
           showToast('success', 'Goal archived successfully');

          } else {
            showToast('error', response.message);
          }
        },

        updateCurrentGoal: <K extends keyof Goal>(key: K, value: Goal[K]) => {
              set((state) => {
                if (state.currentGoal) {
                  state.currentGoal[key] = value;
                  state.pendingChanges = true;
                }
              });
              // console.log('Current goal updated:', get().currentGoal);
              get().validateGoal();
            },

        // Add new function to find goal by ID using binary search
        findGoalById: (goalId: UUID) => {
            const { goalPreviews } = get();

            // Sort goals by ID for binary search
            const sortedGoals = quicksort([...goalPreviews], (a, b) =>
                a.goalid.toString().localeCompare(b.goalid.toString())
            );

            // Define comparator for binary search
            const comparator = (goal: Goal, id: UUID) =>
                goal.goalid.toString().localeCompare(id.toString());

            // Use binary search to find the goal
            const index = binarySearch(sortedGoals, goalId, comparator);

            return index !== -1 ? sortedGoals[index] : undefined;
        },

        handleDeleteGoal: async (goalid, noteid) => {
              const previousGoals = get().goalPreviews;

              set((state) => {
                // Use binary search to efficiently find and remove the goal
                const sortedGoals = quicksort([...state.goalPreviews], (a, b) =>
                    a.goalid.toString().localeCompare(b.goalid.toString())
                );

                const comparator = (goal: Goal, id: UUID) =>
                    goal.goalid.toString().localeCompare(id.toString());

                const index = binarySearch(sortedGoals, goalid, comparator);

                if (index !== -1) {
                    // Find the actual index in the unsorted array
                    const foundGoal = sortedGoals[index];
                    const actualIndex = state.goalPreviews.findIndex(g => g.goalid === foundGoal.goalid);

                    if (actualIndex !== -1) {
                        state.goalPreviews.splice(actualIndex, 1);
                    }
                }
              });

              const response = await goalsApi.delete(goalid, noteid);
              if (!response) {
                // revert deletion
                set({ goalPreviews: previousGoals });
              }
        },
    })))