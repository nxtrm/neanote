import { Tag } from "./tagTypes";

export interface Subtask {
    subtask_id: number;
    description: string;
    completed: boolean;
  };

export interface TaskUpdate extends Task {
    updateType: 'add' | 'update' | 'delete';
  }

export interface Task {
    noteid: number;
    taskid: number;
    title: string;
    content: string;
    completed: boolean;
    due_date: Date | undefined;
    subtasks: Subtask[];
    tags: Tag[];
  };

  export interface TaskResponse {
    data: Task;
    message: string
  }


  export interface TaskPreviewResponse {
    data: Task[] | undefined;
    message: string;
  }