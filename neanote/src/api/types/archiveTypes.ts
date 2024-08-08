import { UUID } from "crypto";
import { Tag } from "./tagTypes";

export interface ArchiveType {
    noteid: UUID
    secondaryid: UUID
    
    title:string
    content:string
    type:string
    tags:Tag[]
}

export interface ArchiveResponse {
    success:boolean
    data:ArchiveType[]
    pagination:{
        page:number
        perPage:number
        total:number
        nextPage:number | null
    }
}