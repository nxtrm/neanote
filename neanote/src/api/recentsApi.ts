import { get } from "http";
import { ArchiveType } from "./types/archiveTypes";
import a from "./api";

interface RecentsResponse {
    data: ArchiveType[];
    message: string;
}

export const recentsApi = {
    getRecents : async () => {
        try {
            let response = await a.get<RecentsResponse>('/api/recents');
            let success = false
            if (response.status === 200)
                success = true
            return{data: response.data, success: success};
        } catch (error) {
            return false;
        }
    }
}