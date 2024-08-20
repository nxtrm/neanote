import { UUID } from "crypto";
import a from './api';
import { TaskCreateResponse, TaskPreviewResponse, TaskResponse } from "./types/taskTypes";

const tasksApi = {
    create: async (title, tags, content, subtasks, due_date) => {
        try {
            let response = await a.post<TaskCreateResponse>(`/api/tasks/create`, {
                title,
                tags,
                content,
                subtasks: subtasks.map((subtask) => {
                    const { description, completed, index } = subtask;
                    return { description, completed, index };
                }),
                due_date,
            });

            if (response.status === 200) {
                return { success: true, data: response.data.data };
            } else {
                return { success: false, message: 'There was an error creating the task' };
            }
        } catch (error) {
            return { success: false, message: error.message || 'An unknown error occurred' };
        }
    },

    getTaskPreviews: async (pageParam) => {
        try {
            let response = await a.get<TaskPreviewResponse>(`/api/tasks/previews`, { params: { pageParam } });
            return { success: true, data: response.data.tasks, nextPage: response.data.pagination.nextPage, page: response.data.pagination.page }; //perPage, total to be added
        } catch (error) {
            return { success: false, message: error.message || 'Failed to fetch task previews' };
        }
    },

    getTask: async (noteid: string) => {
        try {
            let response = await a.get<TaskResponse>(`/api/task`, { params: { noteid } });
            return { success: true, data: response.data.task };
        } catch (error) {
            return { success: false, message: error.message || 'Failed to fetch task' };
        }
    },

    update: async (taskUpdates: {}) => {
        try {
            const response = await a.put(`/api/tasks/update`, taskUpdates);
            return response.status === 200
                ? { success: true }
                : { success: false, message: 'There was an error updating the task' };
        } catch (error) {
            return { success: false, message: error.message || 'An unknown error occurred' };
        }
    },

    delete: async (taskId: UUID, noteId: UUID) => {
        try {
            const response = await a.put(`/api/tasks/delete`, { taskId, noteId });
            return response.status === 200
                ? { success: true }
                : { success: false, message: 'Failed to delete task' };
        } catch (error) {
            return { success: false, message: error.message || 'An unknown error occurred' };
        }
    },

    toggleCompleteness: async (taskId: UUID, subtaskId: UUID | null) => {
        try {
            const response = await a.put(`/api/tasks/toggle`, { taskid: taskId, subtaskid: subtaskId });
            return response.status === 200
                ? { success: true }
                : { success: false, message: 'Failed to toggle task completeness' };
        } catch (error) {
            return { success: false, message: error.message || 'An unknown error occurred' };
        }
    }
};

    


export default tasksApi;