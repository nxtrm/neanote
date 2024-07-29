import { UUID } from "crypto";
import { Tag } from "./tagTypes";
import { Task } from "./taskTypes";

export interface Habit {
    habitid:UUID;
    noteid:UUID

    title: string;
    content:string
    reminder: ReminderTime;
    streak: number;
    tags: Tag[];
    linked_tasks : Task[]
    completed_today: boolean;
}

export interface HabitPreview {
    habitid:UUID;
    noteid:UUID

    title: string;
    content: string;
    streak: number;
    completed_today: boolean;
    tags: Tag[];
}

export interface HabitCreateResponse {
    message: string
    data: {habitid: UUID, noteid: UUID};
}

export interface HabitResponse {
    message: string
    data: Habit ;
}

export interface HabitPreviewResponse {
    message: string
    data: HabitPreview[];
}

export interface ReminderTime {
    reminder_time: string | undefined;
    repetition: string | undefined;
}