import { showToast } from "../../components/Toast";
import a from './api'
import { TaskPreview, TaskResponse } from "./types/taskTypes";

const tasksApi = {
    create: async (taskTitle, tags, textField, subtasks,dueDate, dueTime) => {
        try {
            let response = await a.post<TaskResponse>(`/api/tasks/create`, {
                taskTitle,
                tags,
                textField,
                subtasks,
                dueDate,
                dueTime
            });

            if (response.status === 200) {
                showToast('s', 'Task has been created successfully');
            } else {
                showToast('e', 'There was an error creating the task')
            }

            return response.data;
        } catch (error) {
            showToast('e', error);
            return false;
        }
    },
    getAll : async () => {
        try {
            let response = await a.get<TaskResponse>(`/api/tasks/`);

            return response.data;
        } catch (error) {
            showToast('e', error);
            return false;
        }
    },

    update: async (taskUpdates: TaskPreview[]) => {
        try {
            const response = await a.post(`/api/tasks/update`, taskUpdates);
            return true
        } catch (error) {
            showToast('e', error);
            return false
        }
    },

    toggleCompleteness: async (taskId: number, subtaskId: number| null) => {
        try {
            const response = await a.post(`/api/tasks/toggle-checkbox`, { taskId, subtaskId });
            if (response.status === 200) {
                
            } else {
                showToast('e', 'There was an error updating the task');
            }
            return true;
        } catch (error) {
            showToast('e', error);
            return false;
        }

    }

    
}

export default tasksApi;