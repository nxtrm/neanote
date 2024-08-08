import axios from "axios";
import { showToast } from "../../components/Toast";
import a from "./api";
import {  GoalResponse, GoalsPreview } from "./types/goalTypes";
import { UUID } from "crypto";

const goalsApi = {
    create: async (title, selectedTagIds, content, due_date, milestones) => {
        try {
            let response = await a.post(`/api/goals/create`, {
                title,
                tags: selectedTagIds,
                content,
                due_date,
                milestones: milestones.map((milestone) => {
                    const { description, completed, index } = milestone;
                    return { description, completed, index };
                }),
            });

            if (response.status === 200) { 
                return { success: true, data: response.data };
            } else {
                return { success: false, message: 'An error occurred while creating the goal' };
            }
        } catch (error) {
            const errorMessage = axios.isAxiosError(error) 
                ? error.response?.data?.message || 'An error occurred while creating the goal'
                : 'An unexpected error occurred';
            return { success: false, message: errorMessage };
        }
    },

    getGoalPreviews: async (page: number) => {
        try {
            const response = await a.get<GoalsPreview>(`/api/goals/previews?page=${page}`);
            return { success: true, data: response.data.goals, nextPage: response.data.pagination.nextPage, page: response.data.pagination.page }; //total, perPage
        } catch (error) {
            const errorMessage = axios.isAxiosError(error) 
                ? error.response?.data?.message || 'An error occurred while fetching goal previews'
                : 'An unexpected error occurred';
            return { success: false, message: errorMessage };
        }
    },

    getGoal: async (noteId: string) => {
        try {
            const response = await a.get<GoalResponse>("/api/goal", { params: { noteId } });
            return { success: true, data: response.data.goal };
        } catch (error) {
            const errorMessage = axios.isAxiosError(error) 
                ? error.response?.data?.message || 'An error occurred while fetching the goal previews'
                : 'An unexpected error occurred';
            return { success: false, message: errorMessage };
        }
    },

    completeMilestone: async (goalid: UUID, milestoneid: UUID) => {
        try {
            const response = await a.put(`/api/goals/milestone/complete`, { goalid, milestoneid });
            return response.status === 200
                ? { success: true }
                : { success: false, message: 'An error occurred while completing the milestone' };
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.message || 'An error occurred while completing the milestone'
                : 'An unexpected error occurred';
            return { success: false, message: errorMessage };
        }
    },

    update: async (goalUpdates: {}) => {
        try {
            const response = await a.put(`/api/goals/update`, goalUpdates);

            if (response.status === 200) {
                return { success: true };
            } else {
                return { success: false, message: 'There was an error updating the goal' };
            }
        } catch (error) {
            const errorMessage = axios.isAxiosError(error) 
                ? error.response?.data?.message || 'An error occurred while updating goals'
                : 'An unexpected error occurred';
            return { success: false, message: errorMessage };
        }
    },

    delete: async (goalid: UUID, noteid: UUID) => {
        try {
            const response = await a.delete(`/api/goals/delete`, { params: { goalid, noteid } });

            if (response.status === 200) {
                return { success: true };
            } else {
                return { success: false, message: 'There was an error deleting the goal' };
            }
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.message || 'Failed to delete goal'
                : 'An unexpected error occurred';
            return { success: false, message: errorMessage };
        }
    }
}

export default goalsApi;