import { Tag } from "./tagTypes";
import { TaskPreview } from "./taskTypes";

export interface Habit {
    habitid: number;
    noteid:number

    title: string;
    content:string
    reminder: ReminderTime;
    streak: number;
    tags: Tag[];
    linked_tasks : TaskPreview[]
    completed_today: boolean;
}

export interface HabitPreview {
    habitid: number;
    noteid:number

    title: string;
    content: string;
    streak: number;
    completed_today: boolean;
    tags: Tag[];
}

export interface HabitCreateResponse {
    message: string
    data: {habitid: number, noteid: number};
}

export interface HabitResponse {
    message: string
    data: Habit[] ;
}

export interface HabitPreviewResponse {
    message: string
    data: HabitPreview[];
}

export interface ReminderTime {
    reminder_time: string | undefined;
    repetition: string | undefined;
}