import { UUID } from "crypto";
import { Tag } from "./tagTypes";

export interface Goal {
    goalid: UUID;
    noteid: UUID;

    title: string;
    content :string
    due_date: Date | undefined   
    milestones: Milestone[];
    tags: Tag[];
}

export interface Milestone {
    milestoneid: UUID;
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

export interface GoalResponse {
    goal: Goal;
    message: string;
}

export interface GoalCreateResponse {
    message: string
    data: {goalid: UUID, noteid: UUID};
}