import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { Column, Id, Task } from "../../../src/types"
import { FaPlusCircle, FaTrash } from "react-icons/fa";
import {CSS} from "@dnd-kit/utilities"
import { useMemo, useState } from "react";
import TaskCard from "./TaskCard";

interface Props {
    column: Column
    deleteColumn: (id:Id) => void
    updateColumn: (id:Id, title:string) => void
    createTask: (columnId:Id) => void
    deleteTask: (id:Id) => void
    updateTask: (id:Id, content:string) => void
    tasks:Task[]
}

function ColumnContainer({
  column,
  deleteColumn,
  updateColumn,
  createTask,
  tasks,
  deleteTask,
  updateTask,
}: Props) {
    const [editMode, setEditMode] = useState(false)
    const {setNodeRef, attributes, listeners,transform,transition,isDragging} = useSortable({
        id: column.id,
        data:{
            type:"Column",
            column,
        },
        disabled:editMode
    })
    const tasksIds = useMemo(() => {
        return tasks.map((task) => task.id)}, [tasks])

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (<div 
    ref={setNodeRef}
    style={style}
    className="
    bg-secondaryBackgroundColor
    w-[400px]
    opacity-40
    border-accentColor
    border-2
    h-[500px]
    max-h-[500px]
    rounded-md
    flex
    flex-col
    "
    ></div>
    );
  }

  return (
    <div 
        ref={setNodeRef}
        style={style}
        className="
        bg-secondaryBackgroundColor
        w-[400px]
        h-[500px]
        max-h-[500px]
        rounded-md
        flex
        flex-col
    ">
      {/* Column title */}
      <div 
            onClick={() => setEditMode(true)}
            {...attributes}
            {...listeners}
            className="text-md
            bg-mainBackgroundColor
            h-[60px]
            cursor-grab
            rounded-md
            p-3
            flex
            font-bold
            border-secondaryBackgroundColor
            border-4
            items-center
            justify-between">
        <div className="flex gap-3">
            <div className="flex
                justify-center
                items-center
                bg-secondaryBackgroundColor
                px-2
                py-1
                text-sm
                rounded-md">{tasks.length}</div>
                {!editMode && column.title}
                {editMode && 
                <input 
                className="bg-black
                focus:border-accentColor
                border-rounded-md
                border-2
                outline-none
                px-2"
                value={column.title}
                onChange={(e)=> updateColumn(column.id, e.target.value)}
                onKeyDown={e =>{if (e.key != "Enter") return
                    setEditMode(false)}
                }
                onBlur={()=>setEditMode(false)} 
                autoFocus 
                type="text" 
                />}
            
        </div>
        <button
          onClick={() => {
            deleteColumn(column.id);
          }}
          className="
        stroke-gray-500
        hover:stroke-white
        hover:bg-columnBackgroundColor
        rounded
        px-1
        py-2
        "
        >
          <FaTrash />
        </button>
      </div>

      {/* Column task container */}
      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
      <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>
        <div className="
            p-5
            bg-mainBackgroundColor
            rounded-md
            border-secondaryBackgroundColor
            border-4
            "
            >
          <button className="
            flex gap-2
            items-center
            border-mainBackgroundColor
            rounded-md
            border-x-secondaryColor
            hover:text-primaryColor
            
            h-5

            " 
            onClick={() => {
                createTask(column.id)
            }} ><FaPlusCircle /> Add Task
          </button>
        </div>
    </div>
)}

export default ColumnContainer;