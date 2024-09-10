import { showToast } from "../../components/Toast";
import a from "./api";
import { UniversalType } from "./types/ArchiveTypes";

export interface SearchResponse {
    data: UniversalType[];
    pagination : {
      nextPage: number | null;
      perPage: number;
      total: number;
      page: number;
    };
    message: string;
}

interface RecentsResponse {
    data: UniversalType[];
    message: string;
}

interface SummarizeResponse {
    data:string
    message: string;
}

export const universalApi = {
    search : async (searchQuery:string, searchMode: string, pageParam:number) => {
        try {
            let response = await a.get<SearchResponse>(`/api/search`, {params:{searchQuery, searchMode, pageParam}});
            return { data: response.data.data, pagination:{nextPage: response.data.pagination.nextPage, page: response.data.pagination.page} };
        } catch (error) {
            showToast('e', error);
            return null;
        }
    },

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
    },

    getDue : async(startDate,endDate) => {
        try {
            let response = await a.get('/api/calendar', {params:{startDate, endDate}});
            let success = false
            if (response.status === 200)
                success = true
            return{data: response.data, success: success};
        } catch (error) {
            return false;
    }},

    summarize : async (text:string) => {
        try {
            let response = await a.post<SummarizeResponse>('/api/summarize', {text});
            let success = false
            if (response.status === 200)
                success = true
            return{data: response.data, success: success};
        } catch (error) {
            return false;
        }

    }


}