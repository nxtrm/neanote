import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { ArchiveType } from "../../api/types/archiveTypes"
import archiveApi from "../../api/archiveApi"
import { showToast } from "../../../components/Toast"

type ArchiveState = {
    archive: ArchiveType[]

    handleDelete: () => void
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
                    set({ archive: response.data })
                    if (response.nextPage) {
                        set({ nextPage: response.nextPage })
                    }
                else {
                    showToast('error', response.message);
                }}
            } finally {
                set({ loading: true });
            }
            
        },
        handleDelete: async () => {}, //implement this
        handleRestore: async () => {},
        
    })))