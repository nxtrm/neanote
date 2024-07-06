import { showToast } from "../../components/Toast";
import a from './api'
import { TaskPreview, TaskResponse } from "./types/taskTypes";

const tasksApi = {
    create: async (taskTitle, tags, textField, subtasks,dueDate) => {
        try {
            let response = await a.post<TaskResponse>(`/api/tasks/create`, {
                taskTitle,
                tags,
                textField,
                subtasks,
                dueDate,
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

            console.log(response.data)
            return response.data;
        } catch (error) {
            showToast('e', error);
            return false;
        }
    },

    update: async (taskUpdates: {}) => {
        try {
            const response = await a.post(`/api/tasks/update`, taskUpdates);
            return true
        } catch (error) {
            showToast('e', error);
            return false
        }
    },

    delete : async (taskId: number,noteId:number) => {
        try {
            const response = await a.post(`/api/tasks/delete`, {taskId,noteId})
            if (response.status === 200) {
                return true
        }
        } catch (error) {
            showToast('e', error);
            return false
        }
    },

    toggleCompleteness: async (taskId: number, subtaskId: number| null) => {
        try {
            const response = await a.post(`/api/tasks/toggle`, {"taskId": taskId,"subtaskId": subtaskId });
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