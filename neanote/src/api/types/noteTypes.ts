import { UUID } from "crypto";
import { Tag } from "./tagTypes";

export interface Note {
    noteid: UUID;

    title: string;
    content: string;
    tags: UUID[] | Tag[];
  };

  export interface NoteResponse {
    note: NotewithIds;
    message: string
  }

  export interface NotewithIds extends Note {
    tags:UUID[]
  }

  export interface NoteCreateResponse {
    message: string
    data: {noteid: UUID};
  }

  export interface NotePreviewResponse {
    notes: Note[];
    pagination : {
      nextPage: number | null;
      perPage: number;
      total: number;
      page: number;
    };
    message: string;
    }
