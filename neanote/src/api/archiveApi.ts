import { UUID } from "crypto";
import a from "./api";
import axios from "axios";
import { showToast } from "../../components/Toast";
import { get } from "http";
import { ArchiveResponse } from "./types/archiveTypes";

const archiveApi = {

    archive: async (noteId:UUID) => {
        try {
            const response = await a.put(`/api/notes/archive`, {noteId});

            if (response.status === 200) {
                showToast('s', 'Archived successfully');
            }
        } 
        catch (error) {
            if (axios.isAxiosError(error)) {
                showToast('e', error.response?.data?.message || 'An error occurred while archiving the note');
            } else {
                showToast('e', 'An unexpected error occurred');
            }
            return null;

        }
    },

    getAll:async (pageParam)=> {
        try {
            const response = await a.get<ArchiveResponse>(`/api/notes/archive`, {params:{pageParam}});

            if (response.status === 200) {
                return { success: true, data: response.data.data, nextPage: response.data.nextPage };}
            } catch (error) {
                return { success: false, message: error.message || 'Failed to fetch archived notes' };
            }
    }
}

export default archiveApi
