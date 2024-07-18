import { Tag } from "./tagTypes";

export interface Goal {
    goalid: number;
    noteid: number;

    title: string;
    content :string
    due_date: Date | undefined   
    milestones: Milestone[];
    tags: Tag[];
}

export interface Milestone {
    milestoneid: number;
    goalid: number;

    description: string;
    completed: boolean;
    index: number;
}

export interface GoalsPreview {
    goals: Goal[];
    nextPage: number;
    message: string;
}

export interface GoalCreateResponse {
    message: string
    data: {goalid: number, noteid: number};
}