import { FaTrash } from "react-icons/fa"
import { Id, Task } from "../types"
import { useState } from "react"

interface Props{
    task: Task
    deleteTask: (id:Id) => void
}

function TaskCard({task, deleteTask}:Props) {
    const [mouseIsOver, setMouseIsOver] = useState(false)
  return (
    <div onMouseEnter={()=> setMouseIsOver(true)} onMouseLeave={() => setMouseIsOver(false)} className="
    bg-mainBackgroundColor 
    p-2 h-[100px] min-h-[100px] 
    items-center flex 
    text-left rounded-xl hover:ring-2 
    hover:ring-insert hover:ring-secondaryColor 
    cursor-grab
    justify-between
    ">
        {task.content}
        {mouseIsOver && <button
          onClick={() => {deleteTask(task.id)}}
         className="p-2 bg-secondaryBackgroundColor rounded-md opacity-50 hover:opacity-100">
            <FaTrash size={15} color="#267d67"/>
        </button>
}
    </div>
  )
}

export default TaskCard