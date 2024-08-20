import { UUID } from "crypto";
import { Tag } from "./tagTypes";

export interface UniversalType {
    noteid: UUID
    secondaryid: UUID

    title:string
    content:string
    type:string
    tags:Tag[]
}

export interface ArchiveResponse {
    success:boolean
    data:UniversalType[]
    pagination:{
        page:number
        perPage:number
        total:number
        nextPage:number | null
    }
}