import { showToast } from "../../components/Toast";
import a from "./api";
import tasksApi from "./tasksApi";
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
    add : async (taskId: number, tagId: number) => {

    }


}
export default tasksApi