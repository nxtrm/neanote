import Title from "./Title"
import React from 'react'
import {Separator }from "../@/ui/separator"
import ModuleLink from "./ModuleLink"


export const modules = [
    {link: 'notes', text: 'Notes', disabled: false},
    {link: 'memory', text: 'Memory', disabled: true},
    {link: 'tasks', text: 'Tasks', disabled: false},
    {link: 'goals', text: 'Goals', disabled: false},
    {link: 'habits', text: 'Habits', disabled: false},
    {link: 'events', text: 'Events', disabled: true},
    {link: 'projects', text: 'Projects', disabled: true},
    {link: 'archive', text: 'Archive', disabled: true},
    {link: 'tags', text: 'Tags', disabled: false},
]

function Sidebar() {
  return (
    <div className="flex rounded-xl flex-col w-full min-h-screen border-[2px] p-2">
      <Title/>
      <Separator />
      <div className="flex flex-col gap-4 pt-5">
        <div>Calendar</div>
        {modules.map((module) => (
          <ModuleLink key={module.link} link={module.link} text={module.text} disabled={module.disabled} />
        ))}
      </div>
    </div>
  )
}

export default Sidebar