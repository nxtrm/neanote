import { showToast } from "../../components/Toast";
import a from './api'

const habitsApi = {
    create: async (title, tags, content, reminder) => {
        try {
            let response = await a.post(`/api/habits/create`, {
                title,
                tags,
                content,
                reminder,
            });

            if (response.status === 200) {
                showToast('s', 'Habit has been created successfully');
            } else {
                showToast('e', 'There was an error creating the task')
            }

            return response.data;
        } catch (error) {
            showToast('e', error);
            return false;
        }
    },
    // getAll : async () => {
    //     try {
    //         let response = await a.get<TaskResponse>(`/api/tasks/`);

    //         console.log(response.data)
    //         return response.data;
    //     } catch (error) {
    //         showToast('e', error);
    //         return false;
    //     }
    // },

    // update: async (taskUpdates: {}) => {
    //     try {
    //         const response = await a.post(`/api/tasks/update`, taskUpdates);
    //         return true
    //     } catch (error) {
    //         showToast('e', error);
    //         return false
    //     }
    // },

    // delete : async (taskId: number,noteId:number) => {
    //     try {
    //         const response = await a.post(`/api/tasks/delete`, {taskId,noteId})
    //         if (response.status === 200) {
    //             return true
    //     }
    //     } catch (error) {
    //         showToast('e', error);
    //         return false
    //     }
    // },
    
}

export default habitsApi;