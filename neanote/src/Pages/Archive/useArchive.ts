import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { ArchiveType } from "../../api/types/archiveTypes"
import archiveApi from "../../api/archiveApi"
import { showToast } from "../../../components/Toast"
import { UUID } from "crypto"
import habitsApi from "../../api/habitsApi"
import tasksApi from "../../api/tasksApi"
import goalsApi from "../../api/goalsApi"

type ArchiveState = {
    archive: ArchiveType[]

    handleDelete: (noteType:string,noteId:UUID,secondaryId:UUID) => Promise<void>
    handleRestore: (noteId:UUID) => Promise<void>
    fetchArchivedNotes: (pageParam:number) => void
    nextPage: number | null

    loading:boolean
}

export const useArchive = create<ArchiveState>()(
    immer((set, get) => ({
        archive: [],
        nextPage:null,

        loading:false,

        
        fetchArchivedNotes: async (pageParam) => {
            set({ loading: true });
            try {

                const response = await archiveApi.getAll(pageParam)
                if (response && response.success) {
                    set({ archive: response.data, nextPage: response.nextPage })

                } else {
                    showToast('error', response?.message);
                }
            } finally {
                set({ loading: true });
            }
            
        },
        handleDelete: async (noteType: string, noteId: UUID, secondaryId: UUID) => {
            try {
                let response = false;
        
                switch (noteType) {
                    case 'habit':   
                         response = (await habitsApi.delete(secondaryId, noteId)).success;
                        break;
                    case 'task':
                         response = (await tasksApi.delete(noteId, secondaryId)).success
                        break;
                    case 'goal':
                         response = (await goalsApi.delete(noteId, secondaryId)).success
                        break;
                    default:
                        showToast('e', 'Invalid note type');
                        return;
                }
        
                if (response) {
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
        }, //implement this
        handleRestore: async (noteId:UUID) => {
                const response = await archiveApi.restore(noteId);
                if (response) {
                    set((state) => {
                        state.archive = state.archive.filter((note) => note.noteid !== noteId);
                    });
                    
                }

        },
        
    })))