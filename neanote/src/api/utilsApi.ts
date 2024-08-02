import { UUID } from "crypto";
import a from "./api";
import axios from "axios";
import { showToast } from "../../components/Toast";

const utilsApi = {

    archive: async (noteId:UUID) => {
        try {
            const response = await a.post(`/api/archive`, {noteId});

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
    }
}

export default utilsApi
