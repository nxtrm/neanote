import { showToast } from "../../components/Toast";
import a from "./api";
import { ArchiveType } from "./types/archiveTypes";

export interface SearchResponse {
    data: ArchiveType[];
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