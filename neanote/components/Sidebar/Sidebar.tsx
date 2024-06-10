import Title from "./Title"
import React from 'react'
import {Separator }from "../@/ui/separator"

function Sidebar() {
  return (
    <div className="pt-1 pl-2 flex rounded-xl justify-center w-[180px] min-h-screen border-[2px]">
        <div className=" ">
            <Title/>
            
        <div className="w-full pt-2">
            <Separator />
            content
        </div>
        </div>
    </div>
  )
}

export default Sidebar