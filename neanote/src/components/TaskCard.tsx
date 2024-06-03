import { FaTrash } from "react-icons/fa"
import { Id, Task } from "../types"
import { useState } from "react"

interface Props{
    task: Task
    deleteTask: (id:Id) => void
    updateTask: (id:Id, content:string) => void
}

function TaskCard({task, deleteTask,updateTask}:Props) {
    const [editMode, setEditMode] = useState(false)
    const [mouseIsOver, setMouseIsOver] = useState(false)
    const toggleEditMode = () => {
      setEditMode(!editMode)
      setMouseIsOver(false)
    }
  if (editMode) {
    return <div 
    className="
    bg-mainBackgroundColor 
    p-2 h-[100px] min-h-[100px] 
    items-center flex 
    text-left rounded-xl hover:ring-2 
    hover:ring-insert hover:ring-secondaryColor 
    cursor-grab
    justify-between
    ">
        <textarea
        className="
        h-[90%]
        w-full
        resize-none
        border-none
        rounded
        bg-transparent
        text-white
        focus:outline-none"
        value={task.content}
        autoFocus
        placeholder="Enter task content"
        onBlur={toggleEditMode}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.shiftKey) {toggleEditMode()}
        }}
        onChange={e => updateTask(task.id, e.target.value)}
        ></textarea>

    </div>
  }


  return (
    <div 
    onClick={toggleEditMode}
    onMouseEnter={()=> setMouseIsOver(true)} onMouseLeave={() => setMouseIsOver(false)} className="
    bg-mainBackgroundColor 
    p-2 h-[100px] min-h-[100px] 
    items-center flex 
    text-left rounded-xl hover:ring-2 
    hover:ring-insert hover:ring-secondaryColor 
    cursor-grab
    justify-between
    task
    ">  
    <p className="
    my-auto
    h-[90%]
    w-full
    overflow-y-auto
    overflow-x-auto
    whitespace-pre-wrap">

        {task.content}
    </p>
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