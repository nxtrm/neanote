import { UUID } from "crypto";
import { showToast } from "../../components/Toast";
import a from './api'
import { TaskPreviewResponse, TaskResponse } from "./types/taskTypes";

const tasksApi = {
    create: async (title, tags, content, subtasks,due_date) => {
        try {
            let response = await a.post(`/api/tasks/create`, {
                title,
                tags,
                content,
                subtasks : subtasks.map((subtask) => {
                    const {description, completed, index} = subtask
                    return {description, completed, index};
                }),
                due_date,
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
    getTaskPreviews : async (pageParam) => {
        try {
            let response = await a.get<TaskPreviewResponse>(`/api/tasks/previews`, {params: {pageParam}});
            return {
                data: response.data.tasks,
                nextPage: response.data.nextPage, 
            };
        } catch (error) {
            showToast('e', error);
            throw error
        }
    },

    
    getTask: async (noteid: string) => {
        try {
            let response = await a.get<TaskResponse>(`/api/task`, {params: {noteid}});
            return response.data;
        } catch (error) {
            showToast('e', error);
            return false;
        }
    }
    ,

    update: async (taskUpdates: {}) => {
        try {
            const response = await a.put(`/api/tasks/update`, taskUpdates);
            return true
        } catch (error) {
            showToast('e', error);
            return false
        }
    },

    delete : async (taskId:UUID,noteId:UUID) => {
        try {
            const response = await a.put(`/api/tasks/delete`, {taskId,noteId})
            if (response.status === 200) {
                return true
        }
        } catch (error) {
            showToast('e', error);
            return false
        }
    },

    toggleCompleteness: async (taskId:UUID, subtaskId:UUID| null) => {
        try {
            const response = await a.put(`/api/tasks/toggle`, {"taskid": taskId,"subtaskid": subtaskId });
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