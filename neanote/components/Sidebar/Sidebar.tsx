import Title from "./Title"
import React from 'react'
import {Separator }from "../@/ui/separator"
import ModuleLink from "./ModuleLink"


export const modules = [
    {link: 'notes', text: 'Notes', disabled: false},
    {link: 'memory', text: 'Memory', disabled: true},
    {link: 'tasks', text: 'Tasks', disabled: false},
    {link: 'goals', text: 'Goals', disabled: true},
    {link: 'habits', text: 'Habits', disabled: false},
    {link: 'events', text: 'Events', disabled: true},
    {link: 'projects', text: 'Projects', disabled: true},
    {link: 'archive', text: 'Archive', disabled: true},
    {link: 'tags', text: 'Tags', disabled: false},
]

function Sidebar() {
  return (
    <div className="pt-1 pl-2 flex rounded-xl justify-center w-[180px] min-h-screen border-[2px]">
        <div className=" ">
            <Title/>
            
        <div className="w-full pt-2 ">
            <Separator />
            <div className="flex flex-col pt-5 gap-4">
              <div>Calendar</div>
              {modules.map((module) => (
                <ModuleLink key={module.link} link={module.link} text={module.text} disabled={module.disabled} />
                // <Button>toyota</Button>
              ))}
            </div>

        </div>
        </div>
    </div>
  )
}

export default Sidebar