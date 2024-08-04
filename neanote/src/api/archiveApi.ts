import { UUID } from "crypto";
import a from "./api";
import axios from "axios";
import { showToast } from "../../components/Toast";
import { get } from "http";
import { ArchiveResponse } from "./types/archiveTypes";

const archiveApi = {

    archive: async (noteId: UUID) => {
        try {
            const response = await a.put(`/api/notes/archive`, { noteId });
            return {
                success: response.status === 200,
                message: response.status === 200 ? 'Archived successfully' : 'Failed to archive the note'
            };
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || 'An error occurred while archiving the note'
                : 'An unexpected error occurred';
            return { success: false, message };
        }
    },

    restore: async (noteId: UUID) => {
        try {
            const response = await a.put(`/api/notes/restore`, { noteId });
            return {
                success: response.status === 200,
                message: response.status === 200 ? 'Restored successfully' : 'Failed to restore the note'
            };
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || 'An error occurred while restoring the note'
                : 'An unexpected error occurred';
            return { success: false, message };
        }
    },

    getAll: async (pageParam: number) => {
        try {
            const response = await a.get<ArchiveResponse>(`/api/notes/archive`, { params: { pageParam } });
            return {
                success: true,
                data: response.data.data,
                nextPage: response.data.nextPage,
            };
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || 'Failed to fetch archived notes'
                : 'An unexpected error occurred';
            return { success: false, message };
        }
    }
};

export default archiveApi;