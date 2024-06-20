import React from 'react'
import PageContainer from '../../../components/PageContainer/PageContainer'
import { useTasks } from './useTasks'
import { Button } from '../../../components/@/ui/button'
import { FaPlus } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import { Separator }from "../../../components/@/ui/separator"

function Tasks() {
    let {
        section,
        setSection
    } = useTasks()

  let allTasks = (
      <div className='p-1'>
        <div className=' flex flex-row justify-between'>
            <p className=' pl-1 text-2xl font-bold' >Tasks</p>
            <Button size="icon" onClick={() => setSection("create task")}>
              <FaPlus />
            </Button>
        </div>
        <div className='pt-2'>
          <Separator />
        </div>
      </div>
  )

  let createTask = (
    <div className='p-1'>
        <div className=' flex flex-row justify-between'>
            <p className=' pl-1 text-2xl font-bold' >Create Task</p>
            <Button size="icon" onClick={() => setSection("all tasks")}>
            <MdCancel size={15}/>
            </Button>
        </div>
        <div className='pt-2'>
          <Separator />
        </div>

    </div>
  )

  return (
    <PageContainer>
        {section == 'all tasks' && allTasks}
        {section == 'create task' && createTask}
    </PageContainer>
  )
}

export default Tasks