import { showToast } from "../../components/Toast";
import a from './api'
import { HabitCreateResponse, HabitPreview, HabitPreviewResponse, HabitResponse } from "./types/habitTypes";

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
    //         let response = await a.get<HabitResponse>(`/api/habits`);

    //         return response.data;
    //     } catch (error) {
    //         showToast('e', error);
    //         return false;
    //     }
    // },

    getHabitPreviews: async () => {
        try {
            let response = await a.get<HabitPreviewResponse>(`/api/habits/previews`);

            return response.data;
        } catch (error) {
            showToast('e', error);
            return false;
        }
    }
    ,

    getHabit: async (habitid: number, noteid: number) => {
        try {
            let response = await a.get<HabitResponse>(`/api/habit`, {params: {habitid, noteid}});
            return response.data;
        } catch (error) {
            showToast('e', error);
            return false;
        }
    }
    ,

    update: async (habitUpdates: {}) => {
        try {
            const response = await a.put(`/api/habits/update`, habitUpdates);
            return true
        } catch (error) {
            showToast('e', error);
            return false
        }
    },

    setCompleted: async (habitid: number) => {
        try {
            const response = await a.put(`/api/habits/complete`, {habitid});
            return true
        } catch (error) {
            showToast('e', error);
            return false
        }
    },

    linkTask: async (habitid: number, taskid:number, type:string) => {
        try {
            const response = await a.put(`/api/habits/link`, {habitid, taskid, type});
            return true
        } catch (error) {
            showToast('e', error);
            return false
        }
    },

    delete : async (habitid: number,noteid:number) => {
        try {
            const response = await a.put(`/api/tasks/delete`, {habitid,noteid})
            if (response.status === 200) {
                return true
        }
        } catch (error) {
            showToast('e', error);
            return false
        }
    },
    
}

export default habitsApi;