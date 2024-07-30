import React, { useEffect } from 'react';
import { Button } from '../../../../components/@/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../../../components/@/ui/dialog";
import CheckBox from '../../../../components/CheckBox/CheckBox';
import { Task } from '../../../api/types/taskTypes';
import { useTasks } from '../../Tasks/useTasks';
import { useHabits } from '../useHabits';

  interface Props {
    linked_tasks: Task[]

  }

function LinkTasks({linked_tasks}: Props) {
  const {tasks, fetchTaskPreviews, nextPage} = useTasks()
  const {toggleLinkTask} = useHabits()
  const [ currentPage, setCurrentPage ] = React.useState(1);

  useEffect(() => {
          if (tasks.length < 1) {
            fetchTaskPreviews(1)
          }
  },[tasks, fetchTaskPreviews])

  const fetchNextPage = () => {
    if (nextPage) {
      fetchTaskPreviews(nextPage)
      setCurrentPage(currentPage + 1)
    }
  }

  const fetchPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      fetchTaskPreviews(currentPage)
    }
  }

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
                        <CheckBox onChange={() => toggleLinkTask(task)} disabled={false} checked={isLinked}/>
                    </div>
                )
            })}
            <div className='flex flex-row items-center gap-2'>
              <Button variant={"secondary"} disabled={currentPage > 1} onClick={fetchPreviousPage}>Previous</Button>
                {currentPage}
              <Button variant={"secondary"} disabled={nextPage?true:false} onClick={fetchNextPage}>Next</Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LinkTasks