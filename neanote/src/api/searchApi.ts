import { showToast } from "../../components/Toast";
import a from "./api";
import { ArchiveType } from "./types/archiveTypes";

interface SearchResponse {
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
    search : async (searchQuery:string, searchMode: string) => {
        try {
            let response = await a.get<SearchResponse>(`/api/search`, {params:{searchQuery, searchMode}});
            return response.data;
        } catch (error) {
            showToast('e', error);
            return false;
        }
    }
}