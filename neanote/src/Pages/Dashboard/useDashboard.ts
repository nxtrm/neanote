
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { universalApi } from "../../api/universalApi";
import { UniversalType } from "../../api/types/ArchiveTypes";
import { showToast } from "../../../components/Toast";

interface Dashboardstate {
    getRecents: () => void;
    recents : UniversalType[]

    loading:boolean

}
export const useDashboard = create<Dashboardstate>()(
    immer((set, get) => ({
        recents: [],
        loading:false,
        getRecents: async () => {
            const response = await universalApi.getRecents();
            if (response && response.success) {
                set((state) => {
                    state.recents = response.data.data
                })
            } else {
                showToast('error', 'An error occurred while fetching recently accessed notes.')
            }
        }

    })))