import { showToast } from "../../components/Toast";
import a from "./api";
import { GoalCreateResponse } from "./types/goalTypes";

const goalsApi = {
    create: async (title, tags, content, due_date, milestones) => {
        try {
            let response = await a.post<GoalCreateResponse>(`/api/goals/create`, {
                title,
                tags,
                content,
                due_date,
                milestones,
            });

            if (response.status === 200) {
                showToast('s', 'Goal has been created successfully');
            } else {
                showToast('e', 'There was an error creating the task')
            }

            return response.data;
        } catch (error) {
            showToast('e', error);
            return false;
        }
    },
}

export default goalsApi