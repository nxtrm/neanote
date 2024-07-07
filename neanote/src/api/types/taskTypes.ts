import { Tag } from "./tagTypes";

export interface Subtask {
    subtask_id: number;
    description: string;
    completed: boolean;
  };

export interface TaskUpdate extends TaskPreview {
    updateType: 'add' | 'update' | 'delete';
  }

export interface TaskPreview {
    noteid: number;
    taskid: number;
    title: string;
    content: string;
    completed: boolean;
    due_date: Date | undefined;
    subtasks: Subtask[];
    tags: Tag[];
  };

  // export interface Task {
  //   id: number;
  //   taskTitle: string;
  //   content: string;
  //   completed: boolean;
  //   dueDate: Date | undefined;
  //   subtasks: Subtask[];
  //   tags: string[];
  //   //add any other needed fields
  // };


  export interface TaskResponse {
    data: TaskPreview[] | undefined;
    message: string;
  }