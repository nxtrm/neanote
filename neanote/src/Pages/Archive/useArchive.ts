import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { ArchiveType } from "../../api/types/archiveTypes"
import archiveApi from "../../api/archiveApi"

type ArchiveState = {
    archive: ArchiveType[]
    fetchArchivedNotes: () => void
}

export const useArchive = create<ArchiveState>()(
    immer((set, get) => ({
        archive: [],
        
        fetchArchivedNotes: async () => {
            const response = await archiveApi.getAll()
            if (response && response.success) {
                set({ archive: response.data })
            }
        }
        
    })))