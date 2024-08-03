import { UUID } from "crypto";

export interface ArchiveType {
    noteid: UUID
    title:string
    content:string
    type:string
}

export interface ArchiveResponse {
    success:boolean
    data:ArchiveType[]
    nextPage:number
}