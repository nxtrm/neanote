import { UUID } from "crypto";

export interface Tag {
    tagid: UUID;
    name: string;
    color: string;
  };

  export interface TagResponse {
    data: Tag[] | undefined;
    message: string;
  }

  export interface TagCreateResponse {
    data: {
      id: UUID
    };
    message: string;
  }