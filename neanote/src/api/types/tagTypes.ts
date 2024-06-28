export interface Tag {
    id: number;
    name: string;
    color: string;
  };

  export interface TagResponse {
    data: Tag[] | undefined;
    message: string;
  }