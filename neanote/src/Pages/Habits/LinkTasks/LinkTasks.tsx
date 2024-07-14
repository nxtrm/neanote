import React, { useEffect } from 'react'
import { Button } from '../../../../components/@/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "../../../../components/@/ui/dialog";
import { TaskPreview } from '../../../api/types/taskTypes';
import { useTasks } from '../../Tasks/useTasks';
import CheckBox from '../../../../components/CheckBox/CheckBox';
import { useHabits } from '../useHabits';

  interface Props {
    linked_tasks: TaskPreview[]

  }

function LinkTasks({linked_tasks}: Props) {
  const {tasks, fetchTasks} = useTasks()
  const {toggleLinkTask} = useHabits()

  const handleLinkTask = (task: TaskPreview) => {
      toggleLinkTask(task)
    }

  useEffect(() => {
          if (tasks.length < 1) {
            fetchTasks()
          }
  },[tasks, fetchTasks])

  return (
    <Dialog>
      <DialogTrigger asChild>

        <Button>Link Tasks</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Link Tasks</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
            {tasks.map((task) => {
                const isLinked = linked_tasks.some((linkedTask) => linkedTask.taskid === task.taskid)
                return (
                    <div key={task.taskid} className="flex border-2 rounded-xl p-2 justify-between items-center">
                        <p className='max-w-[300px] h-7 overflow-hidden'>{task.title}</p>
                        <CheckBox onChange={() => handleLinkTask(task)} disabled={false} checked={isLinked}/>
                    </div>
                )
            })}
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LinkTasks