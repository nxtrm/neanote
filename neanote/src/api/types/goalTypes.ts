import { UUID } from "crypto";
import { Tag } from "./tagTypes";

export interface Goal {
    goalid: UUID;
    noteid: UUID;

    title: string;
    content :string
    due_date: Date | undefined   
    milestones: Milestone[];
    tags: UUID[] | Tag[];
}

export interface Milestone {
    milestoneid: UUID;

    description: string;
    completed: boolean;
    index: number;
    isNew?: boolean;
}

export interface GoalwithIds extends Goal {
    tags:UUID[]
}

export interface GoalsPreview {
    goals: Goal[];
    pagination : {
        page: number;
        perPage: number;
        total: number;
        nextPage: number | null;
    }
    message: string;
}

export interface GoalResponse {
    success:boolean
    goal: GoalwithIds;
    message: string;
}

export interface GoalCreateResponse {
    message: string
    data: {goalid: UUID, noteid: UUID, milestones: Milestone[]};
}