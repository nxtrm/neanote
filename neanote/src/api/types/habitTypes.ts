import { Tag } from "./tagTypes";

export interface Habit {
    habitid: number;
    noteid:number

    title: string;
    content:string
    reminder: ReminderTime;
    streak: number;
    tags: Tag[];
    completed_today: boolean;
}

export interface HabitResponse {
    message: string
    data: Habit[];
}

export interface ReminderTime {
    reminder_time: string | undefined;
    repetition: string | undefined;
}