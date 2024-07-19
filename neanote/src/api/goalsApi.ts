import { showToast } from "../../components/Toast";
import a from "./api";
import { GoalCreateResponse, GoalResponse, GoalsPreview } from "./types/goalTypes";

const goalsApi = {
    create: async (title, tags, content, due_date, milestones) => {
        try {
            let response = await a.post<GoalCreateResponse>(`/api/goals/create`, {
                title,
                tags,
                content,
                due_date,
                milestones,
            });

            if (response.status === 200) {
                showToast('s', 'Goal has been created successfully');
            } else {
                showToast('e', 'There was an error creating the task')
            }

            return response.data;
        } catch (error) {
            showToast('e', error);
            return false;
        }
    },
    get_previews: async (page: number) => {
        try {
            const response = await a.get<GoalsPreview>(`/api/goals/previews?page=${page}`);
            return {
                data: response.data.goals,
                nextPage: response.data.nextPage, 
            };
        } catch (error) {
            showToast('e', error);
            return false;
        }
    },

    getGoal: async (noteId: number) => {
        try {
            const response = await a.get<GoalResponse>("/api/goal", {params: {noteId}});
            return response.data;
        } catch (error) {
            showToast('e', error);
            return false;
    }},

    completeMilestone: async (goalid:number,milestoneid: number) => {
        try {
            const response = await a.put(`/api/goals/milestone/complete`, {goalid, milestoneid});
            if (response.status === 200) {
                return true
            }
            return false
        } catch (error) {
            showToast('e', error);
            return false
        }
    },

    update: async (goalUpdates: {}) => {
        try {
            const response = await a.put(`/api/goals/update`, goalUpdates);
            return true
        } catch (error) {
            showToast('e', error);
            return false
        }
    },
}

export default goalsApi