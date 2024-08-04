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
    handleRestore: () => void
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
            // try {
            //     let success = false;
        
            //     switch (noteType) {
            //         case 'habit':
            //             success = await habitsApi.delete(secondaryId, noteId);
            //             break;
            //         case 'task':
            //             success = await tasksApi.delete(noteId, secondaryId);
            //             break;
            //         case 'goal':
            //             success = await goalsApi.delete(noteId, secondaryId);
            //             break;
            //         default:
            //             showToast('e', 'Invalid note type');
            //             return;
            //     }
        
            //     if (success) {
            //         showToast('s', `${noteType.charAt(0).toUpperCase() + noteType.slice(1)} has been deleted successfully`);
            //     } else {
            //         showToast('e', `Failed to delete ${noteType}`);
            //     }
            // } catch (error) {
            //     showToast('e', `An error occurred while deleting the ${noteType}: ${error.message || error}`);
            // }
        }, //implement this
        handleRestore: async () => {},
        
    })))