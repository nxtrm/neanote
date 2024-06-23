
export interface Subtask {
    id: number;
    text: string;
    completed: boolean;
  };

export interface TaskPreview {
    id: number;
    taskTitle: string;
    content: string;
    completed: boolean;
    dueDate: Date | undefined;
    subtasks: Subtask[];
    tags: string[];
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