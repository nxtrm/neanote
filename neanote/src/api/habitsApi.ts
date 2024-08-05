import { UUID } from "crypto";
import { showToast } from "../../components/Toast";
import a from './api';
import { HabitCreateResponse, HabitPreviewResponse, HabitResponse } from "./types/habitTypes";
import axios from "axios";

const habitsApi = {
    create: async (title, tags, content, reminder) => {
        try {
            const response = await a.post<HabitCreateResponse>('/api/habits/create', { title, tags, content, reminder });
            return { success: true, data: response.data.data, message: 'Habit has been created successfully' };
        } catch (error) {
            return { success: false, data: null, message: axios.isAxiosError(error) ? error.response?.data?.message || 'An error occurred while creating the habit' : 'An unexpected error occurred' };
        }
    },

    getHabitPreviews: async () => {
        try {
            const response = await a.get<HabitPreviewResponse>('/api/habits/previews');
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, data: null, message: axios.isAxiosError(error) ? error.response?.data?.message || 'An error occurred while fetching habit previews' : 'An unexpected error occurred' };
        }
    },

    getHabit: async (noteid: string) => {
        try {
            const response = await a.get<HabitResponse>('/api/habit', { params: { noteid } });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, data: null, message: axios.isAxiosError(error) ? error.response?.data?.message || 'An error occurred while fetching the habit' : 'An unexpected error occurred' };
        }
    },

    update: async (habitUpdates: {}) => {
        try {
            const response = await a.put('/api/habits/update', habitUpdates);
            return { success: response.status === 200, message: response.status === 200 ? 'Habit has been updated successfully' : 'There was an error updating the habit' };
        } catch (error) {
            return { success: false, message: axios.isAxiosError(error) ? error.response?.data?.message || 'An error occurred while updating the habit' : 'An unexpected error occurred' };
        }
    },

    setCompleted: async (habitid: UUID) => {
        try {
            const response = await a.put('/api/habits/complete', { habitid });
            return { success: response.status === 200, streak:response.data.streak, message: response.status === 200 ? '' : 'There was an error setting the habit as completed' };
        } catch (error) {
            return { success: false, message: axios.isAxiosError(error) ? error.response?.data?.message || 'An error occurred while setting the habit as completed' : 'An unexpected error occurred' };
        }
    },

    linkTask: async (habitid: UUID, taskid: UUID, type: string) => {
        try {
            const response = await a.put('/api/habits/link', { habitid, taskid, type });
            return { success: response.status === 200, message: response.status === 200 ? '' : 'There was an error linking the task to the habit' };
        } catch (error) {
            return { success: false, message: axios.isAxiosError(error) ? error.response?.data?.message || 'An error occurred while linking the task to the habit' : 'An unexpected error occurred' };
        }
    },

    delete: async (habitid: UUID, noteid: UUID) => {
        try {
            const response = await a.delete('/api/habits/delete', { params: { habitid, noteid } });
            return { success: response.status === 200, message: response.status === 200 ? 'Habit has been deleted successfully' : 'There was an error deleting the habit' };
        } catch (error) {
            return { success: false, message: axios.isAxiosError(error) ? error.response?.data?.message || 'An error occurred while deleting the habit' : 'An unexpected error occurred' };
        }
    },
};

export default habitsApi;