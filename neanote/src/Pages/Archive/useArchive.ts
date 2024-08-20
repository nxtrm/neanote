import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { UniversalType } from "../../api/types/ArchiveTypes"
import archiveApi from "../../api/archiveApi"
import { showToast } from "../../../components/Toast"
import { UUID } from "crypto"
import habitsApi from "../../api/habitsApi"
import tasksApi from "../../api/tasksApi"
import goalsApi from "../../api/goalsApi"

type ArchiveState = {
    archive: UniversalType[]

    handleDelete: (noteType:string,noteId:UUID,secondaryId:UUID) => Promise<void>
    handleRestore: (noteId:UUID) => Promise<void>
    fetchArchivedNotes: (pageParam:number) => void
    nextPage: number | null
    page:number

    loading:boolean
}

export const useArchive = create<ArchiveState>()(
    immer((set, get) => ({
        archive: [],
        nextPage:null,
        page:1,

        loading:false,

        fetchArchivedNotes: async (pageParam: number) => {
            set({ loading: true });
            try {
                const response = await archiveApi.getAll(pageParam);
                if (response.success) {
                    set({ archive: response.data, nextPage: response.nextPage, page: response.page });
                } else {
                    showToast('error', response.message);
                }
            } finally {
                set({ loading: false });
            }
        },
    
        handleDelete: async (noteType: string, noteId: UUID, secondaryId: UUID) => {
            try {
                let response = { success: false };
    
                switch (noteType) {
                    case 'habit':
                        response = await habitsApi.delete(secondaryId, noteId);
                        break;
                    case 'task':
                        response = await tasksApi.delete(noteId, secondaryId);
                        break;
                    case 'goal':
                        response = await goalsApi.delete(noteId, secondaryId);
                        break;
                    default:
                        showToast('e', 'Invalid note type');
                        return;
                }
    
                if (response.success) {
                    showToast('s', `${noteType.charAt(0).toUpperCase() + noteType.slice(1)} has been deleted successfully`);
                    set((state) => {
                        state.archive = state.archive.filter((note) => note.noteid !== noteId);
                    });
                } else {
                    showToast('e', `Failed to delete ${noteType}`);
                }
            } catch (error) {
                showToast('e', `An error occurred while deleting the ${noteType}: ${error.message || error}`);
            }
        },
    
        handleRestore: async (noteId: UUID) => {
            const response = await archiveApi.restore(noteId);
            if (response.success) {
                showToast('s', 'Restored successfully');
                set((state) => {
                    state.archive = state.archive.filter((note) => note.noteid !== noteId);
                });
            } else {
                showToast('e', response.message);
            }
        }
    })))