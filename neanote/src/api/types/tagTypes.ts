export interface Tag {
    tag_id: number;
    name: string;
    color: string;
  };

  export interface TagResponse {
    data: Tag[] | undefined;
    message: string;
  }