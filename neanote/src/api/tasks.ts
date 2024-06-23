import { showToast } from "../../components/Toast";
import { a } from './api'

const tasks = {
    create: async (userId, taskTitle, tags, textField, subtasks,dueDate, dueTime) => {
        try {
            let response = await a.post(`/api/tasks/${userId}`, {
                userId,
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
    getAll : async (userId) => {
        try {
            let response = await a.get(`/api/tasks/${userId}`);

            return response.data;
        } catch (error) {
            showToast('e', error);
            return false;
        }
    }
    
}