import { UUID } from "crypto";
import { Tag } from "./tagTypes";

export interface Subtask {
    subtaskid: UUID;
    description: string;
    completed: boolean;
    index: number;
  };

export interface TaskUpdate extends Task {
    updateType: 'add' | 'update' | 'delete';
  }

export interface Task {
    noteid: UUID;
    taskid: UUID;

    title: string;
    content: string;
    completed: boolean;
    due_date: Date | undefined;
    subtasks: Subtask[];
    tags: Tag[];
  };

  export interface TaskResponse {
    task: Task;
    message: string
  }

  export interface TaskCreateResponse {
    message: string
    data: {taskid: UUID, noteid: UUID, milestones: Subtask[]};
}

  export interface TaskPreviewResponse {
    tasks: Task[];
    nextPage: number;
    message: string;
  }
