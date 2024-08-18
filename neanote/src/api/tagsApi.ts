import { UUID } from "crypto";
import { showToast } from "../../components/Toast";
import a from "./api";
import { TagCreateResponse, TagResponse } from "./types/tagTypes";

const tagsApi = {
    create : async (name: string, color:string) => {
        try {
            let response = await a.post<TagCreateResponse>(`/api/tags/create`, {
                name,
                color
            })
            let success = false
            if (response.status === 200) {
                showToast('s', 'Tag has been created successfully');
                success = true;
            } else {
                showToast('e', 'There was an error creating the tag')
            }

            return {success: success, tagid: response.data.data.id};
        } catch (error) {
            showToast('e', error);
            return false;
        }
    },
    add : async (noteid: UUID, tagid: UUID) => {
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

    getTags : async (noteId: UUID) => {
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

    delete : async (tagid: UUID) => {
        try {
            let response = await a.put(`/api/tags/delete`, {tagid})
            let success = false
            if (response.status === 200) {
                showToast('s', 'Tag has been deleted successfully');
                success = true;
            } else {
                showToast('e', 'There was an error deleting the tag')
            }
            return {success: success};
        } catch (error) {
            showToast('e', error);
            return false;
        }
    },

    edit : async (tagid: UUID, name: string, color: string) => {
        try {
            let response = await a.put(`/api/tags/edit`, {
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