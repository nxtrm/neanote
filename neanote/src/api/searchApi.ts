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

export const searchApi = {
    search : async (searchQuery:string, searchMode: string, pageParam:number) => {
        try {
            let response = await a.get<SearchResponse>(`/api/search`, {params:{searchQuery, searchMode, pageParam}});
            return { data: response.data.data, pagination:{nextPage: response.data.pagination.nextPage, page: response.data.pagination.page} };
        } catch (error) {
            showToast('e', error);
            return null;
        }
    }
}