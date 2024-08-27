import { UUID } from "crypto";
import a from './api';
import { NoteCreateResponse, NotePreviewResponse, NoteResponse } from "./types/noteTypes";

const notesApi = {
    create: async (title, tags, content) => {
        try {
            let response = await a.post<NoteCreateResponse>(`/api/notes/create`, {
                title,
                tags,
                content,
            });

            if (response.status === 200) {
                return { success: true, data: response.data.data };
            } else {
                return { success: false, message: 'There was an error creating the note' };
            }
        } catch (error) {
            return { success: false, message: error.message || 'An unknown error occurred' };
        }
    },

    getNotePreviews: async (pageParam) => {
        try {
            let response = await a.get<NotePreviewResponse>(`/api/notes/previews`, { params: { pageParam } });
            return { success: true, data: response.data.notes, nextPage: response.data.pagination.nextPage, page: response.data.pagination.page };
        } catch (error) {
            return { success: false, message: error.message || 'Failed to fetch note previews' };
        }
    },

    getNote: async (noteid: string) => {
        try {
            let response = await a.get<NoteResponse>(`/api/note`, { params: { noteid } });
            return { success: true, data: response.data.note };
        } catch (error) {
            return { success: false, message: error.message || 'Failed to fetch note' };
        }
    },

    update: async (noteUpdates: {}) => {
        try {
            const response = await a.put(`/api/notes/update`, noteUpdates);
            return response.status === 200
                ? { success: true }
                : { success: false, message: 'There was an error updating the note' };
        } catch (error) {
            return { success: false, message: error.message || 'An unknown error occurred' };
        }
    },

    delete: async (noteId: UUID) => {
        try {
            const response = await a.put(`/api/notes/delete`, { noteId});
            return response.status === 200
                ? { success: true }
                : { success: false, message: 'Failed to delete note' };
        } catch (error) {
            return { success: false, message: error.message || 'An unknown error occurred' };
        }
    },

};



export default notesApi;