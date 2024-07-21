import axios from "axios";
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
                return response.data;
            }
            } catch (error) {
              // Log error for debugging purposes
              console.error('Error creating goal:', error);
          
              // Display error message to the user
              if (axios.isAxiosError(error)) {
                showToast('e', error.response?.data?.message || 'An error occurred while creating the goal');
              } else {
               
                showToast('e', 'An unexpected error occurred');
              }
          
              return null; 
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
            
            console.error('Error getting goal previews:', error);

            if (axios.isAxiosError(error)) {
              showToast('e', error.response?.data?.message || 'An error occurred while fetching goal previews');
            } else {
             
              showToast('e', 'An unexpected error occurred');
            }
        
            return null; 
          }
    },

    getGoal: async (noteId: number) => {
        try {
            const response = await a.get<GoalResponse>("/api/goal", {params: {noteId}});
            return response.data;
        } catch (error) {
            
            console.error('Error getting goal:', error);

            if (axios.isAxiosError(error)) {
              showToast('e', error.response?.data?.message || 'An error occurred while fetching the goal previews');
            } else {
             
              showToast('e', 'An unexpected error occurred');
            }
        
            return null; 
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

            if (response.status === 200) {
                showToast('s', 'Goal has been updated successfully');
            } else {
                showToast('e', 'There was an error updating the goal')
            }
            return true

        } catch (error) {
            
            console.error('Error updating goal:', error);

            if (axios.isAxiosError(error)) {
              showToast('e', error.response?.data?.message || 'An error occurred while updating goals');
            } else {
             
              showToast('e', 'An unexpected error occurred');
            }
        
            return false; 
        
    }},

    delete: async (goalid: number, noteid: number) => {
        try {
            const response = await a.delete(`/api/goals/delete`, {params: {goalid, noteid}});

            if (response.status === 200) {
                showToast('s', 'Goal has been deleted successfully');
                return true;
            } else {
                showToast('e', 'There was an error deleting the goal');
                return false;
            }
        } catch (error) {
            showToast('e', `Failed to delete goal: ${error.message || error}`);
            return false;
        }
    }
}

export default goalsApi