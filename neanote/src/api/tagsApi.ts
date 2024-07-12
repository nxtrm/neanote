import { showToast } from "../../components/Toast";
import a from "./api";
import { TagResponse } from "./types/tagTypes";

const tagsApi = {
    create : async (name: string, color:string) => {
        try {
            let response = await a.post<TagResponse>(`/api/tags/create`, {
                name,
                color
            });

            if (response.status === 200) {
                showToast('s', 'Tag has been created successfully');
            } else {
                showToast('e', 'There was an error creating the tag')
            }

            return response.data;
        } catch (error) {
            showToast('e', error);
            return false;
        }
    },
    add : async (noteid: number, tagid: number) => {
        try {
            let response = await a.post(`/api/tags/add`, {
                noteid,
                tagid
            });

            if (response.status === 200) {
                return response.data; }
        } catch (error) {
            showToast('e', error);
            return false;
        }
    },

    getTags : async (noteId: number) => {
        try {
            let response = await a.get<TagResponse>(`/api/tags/${noteId}`);
            return response.data;
        } catch (error) {
            showToast('e', error);
            return false;
        }
    },

    getAll : async () => {
        try {
            let response = await a.get<TagResponse>(`/api/tags/`);
            return response.data;
        } catch (error) {
            showToast('e', error);
            return false;
        }
    },

    delete : async (tagid: number) => {
        try {
            let response = await a.put(`/api/tags/delete`, {tagid})

            if (response.status === 200) {
                showToast('s', 'Tag has been deleted successfully');
                return true;
            } else {
                showToast('e', 'There was an error deleting the tag')
                return false;
            }
        } catch (error) {
            showToast('e', error);
            return false;
        }
    },

    edit : async (tagid: number, name: string, color: string) => {
        try {
            let response = await a.post(`/api/tags/edit`, {
                tagid,
                name,
                color
            });

            if (response.status === 200) {
                showToast('s', 'Tag has been updated successfully');
            } else {
                showToast('e', 'There was an error updating the tag')
            }

            return response.data;
        } catch (error) {
            showToast('e', error);
            return false;
        }
    }





}
export default tagsApi