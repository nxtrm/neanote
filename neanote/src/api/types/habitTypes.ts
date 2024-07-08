import { Tag } from "./tagTypes";

export interface Habit {
    habitid: number;
    noteid:number

    title: string;
    content:string
    reminder_time: string;
    streak: number;
    tags: Tag[];
    completed: boolean;
}