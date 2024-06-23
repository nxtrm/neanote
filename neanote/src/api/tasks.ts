import { showToast } from "../../components/Toast";
import a from './api'
import { TaskResponse } from "./types/taskTypes";

const tasks = {
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
    }
    
}

export default tasks;