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
    add : async (noteId: number, tagId: number) => {
        try {
            let response = await a.post(`/api/tags/add`, {
                noteId,
                tagId
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
    }




}
export default tagsApi