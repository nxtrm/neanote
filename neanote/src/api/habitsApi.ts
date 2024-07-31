import { UUID } from "crypto";
import { showToast } from "../../components/Toast";
import a from './api';
import { HabitCreateResponse, HabitPreviewResponse, HabitResponse } from "./types/habitTypes";
import axios from "axios";

const habitsApi = {
    create: async (title, tags, content, reminder) => {
        try {
            let response = await a.post<HabitCreateResponse>(`/api/habits/create`, {
                title,
                tags,
                content,
                reminder,
            });

            if (response.status === 200) {
                showToast('s', 'Habit has been created successfully');
                return response.data;
            }
        } catch (error) {
            console.error('Error creating habit:', error);

            if (axios.isAxiosError(error)) {
                showToast('e', error.response?.data?.message || 'An error occurred while creating the habit');
            } else {
                showToast('e', 'An unexpected error occurred');
            }

            return null;
        }
    },

    getHabitPreviews: async () => {
        try {
            let response = await a.get<HabitPreviewResponse>(`/api/habits/previews`);
            return response.data;
        } catch (error) {

            if (axios.isAxiosError(error)) {
                showToast('e', error.response?.data?.message || 'An error occurred while fetching habit previews');
            } else {
                showToast('e', 'An unexpected error occurred');
            }

            return null;
        }
    },

    getHabit: async (noteid: string) => {
        try {
            let response = await a.get<HabitResponse>(`/api/habit`, { params: { noteid } });
            return response.data;
        } catch (error) {
            console.error('Error getting habit:', error);

            if (axios.isAxiosError(error)) {
                showToast('e', error.response?.data?.message || 'An error occurred while fetching the habit');
            } else {
                showToast('e', 'An unexpected error occurred');
            }

            return null;
        }
    },

    update: async (habitUpdates: {}) => {
        try {
            const response = await a.put(`/api/habits/update`, habitUpdates);

            if (response.status === 200) {
                showToast('s', 'Habit has been updated successfully');
                return true;
            } else {
                showToast('e', 'There was an error updating the habit');
                return false;
            }
        } catch (error) {
            console.error('Error updating habit:', error);

            if (axios.isAxiosError(error)) {
                showToast('e', error.response?.data?.message || 'An error occurred while updating the habit');
            } else {
                showToast('e', 'An unexpected error occurred');
            }

            return false;
        }
    },

    setCompleted: async (habitid: UUID) => {
        try {
            const response = await a.put(`/api/habits/complete`, { habitid });

            if (response.status === 200) {
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error setting habit as completed:', error);

            if (axios.isAxiosError(error)) {
                showToast('e', error.response?.data?.message || 'An error occurred while setting the habit as completed');
            } else {
                showToast('e', 'An unexpected error occurred');
            }

            return false;
        }
    },

    linkTask: async (habitid: UUID, taskid: UUID, type: string) => {
        try {
            const response = await a.put(`/api/habits/link`, { habitid, taskid, type });

            if (response.status === 200) {
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error linking task to habit:', error);

        if (axios.isAxiosError(error)) {
                showToast('e', error.response?.data?.message || 'An error occurred while linking the task to the habit');
            } else {
                showToast('e', 'An unexpected error occurred');
            }

            return false;
        }
    },

    delete: async (habitid: UUID, noteid: UUID) => {
        try {
            const response = await a.delete(`/api/habits/delete`, {params: { habitid, noteid }});

            if (response.status === 200) {
                showToast('s', 'Habit has been deleted successfully');
                return true;
            } else {
                showToast('e', 'There was an error deleting the habit');
                return false;
            }
        } catch (error) {
            console.error('Error deleting habit:', error);

            if (axios.isAxiosError(error)) {
                showToast('e', error.response?.data?.message || 'An error occurred while deleting the habit');
            } else {
                showToast('e', 'An unexpected error occurred');
            }

            return false;
        }
    },
};

export default habitsApi;