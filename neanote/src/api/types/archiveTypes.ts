import { UUID } from "crypto";

export interface ArchiveType {
    noteid: UUID
    title:string
    content:string
    type:string
}