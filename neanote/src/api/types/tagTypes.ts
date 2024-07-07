export interface Tag {
    tagid: number;
    name: string;
    color: string;
  };

  export interface TagResponse {
    data: Tag[] | undefined;
    message: string;
  }