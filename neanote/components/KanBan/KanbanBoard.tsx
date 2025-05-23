import { DndContext, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FaPlusCircle } from "react-icons/fa";
import { Column, Id, Task } from "../../types";
import ColumnContainer from "./ColumnContainer";
import TaskCard from "./TaskCard";
import React from "react";

function KanbanBoard() {
    const [columns, setColumns] = useState<Column[]>([])
    const columnsId = useMemo(()=>columns.map((col)=>col.id),[columns])
    const[activeColumn, setActiveColumn] = useState<Column | null>(null)
    const[activeTask, setActiveTask] = useState<Task | null>(null)

    const[tasks, setTasks] = useState<Task[]>([])

    const sensors = useSensors(
        useSensor(PointerSensor,{activationConstraint: {
            distance:5
        }}),
    )
return (
    <div className="
    m-auto
    flex
    min-h-screen
    w-full
    items-center
    overflow-x-auto
    overflow-y-hidden
    px-[40px]">
        <DndContext onDragOver={onDragOver} sensors={sensors} onDragStart={onDragStart} >

            <div className="m-auto flex gap-6">
                <div className="flex gap-4">
                    <SortableContext items={columnsId}>

                    {columns.map(column => <div>{
                        <ColumnContainer 
                        updateTask={updateTask}
                        createTask={createTask} 
                        deleteTask={deleteTask}
                        key={column.id} 
                        updateColumn={updateColumn} 
                        deleteColumn={deleteColumn} 
                        column={column}
                        tasks={tasks.filter((task) => task.columnId === column.id)} 
                        />}</div>)}
                    </SortableContext>
                </div>

                    <button className="
                            h-[60px]
                            w-[350px]
                            min-w-[350px]
                            cursor-pointer
                            rounded-lg
                            bg-mainBackgroundColor
                            border-20
                            border-primaryColor
                            p-2
                            pl-5
                            ring-secondaryColor
                            hover:ring-2
                            flex
                            gap-3
                            items-center
                            "
                            onClick={() => createNewColumn()}
                            > 
                                    <FaPlusCircle /> 
                                    Add column
                            </button>

            </div>
            {createPortal (<DragOverlay>
                {activeColumn && <ColumnContainer updateTask={updateTask} deleteTask={deleteTask} tasks={tasks.filter((task) => task.columnId === activeColumn.id)} createTask={createTask} column={activeColumn} updateColumn={updateColumn} deleteColumn={deleteColumn}/> }
                {activeTask && <TaskCard deleteTask={deleteTask} updateTask={updateTask} task={activeTask}/>}
                
            </DragOverlay>, document.body)}
        </DndContext>
    </div>
)

    function createNewColumn() {
        const columnToAdd:Column = {
            id: generateId(),
            title: `Column ${columns.length +1}`
        }
        setColumns([...columns, columnToAdd])
        createTask(columnToAdd.id)
        
    }
    function generateId() {
        return Math.floor(Math.random() * 10000)
    }

    function onDragOver(event: DragOverEvent) {
        const{active,over} = event
        if(!over) return
        const activeId =active.id
        const overId = over.id
        if (activeId === overId) return
        
        const isActiveTask = active.data.current?.type === "Task"
        const isOverTask = over.data.current?.type === "Task"

        if (!isActiveTask) return

        if (isActiveTask && isOverTask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((task) => task.id === activeId)
                const overIndex = tasks.findIndex((task) => task.id === overId)
                
                tasks[activeIndex].columnId = tasks[overIndex].columnId

                return arrayMove(tasks, activeIndex, overIndex)
            }
            
        )

        const isOverColumn = over.data.current?.type === "Column"

        if (isActiveTask && isOverColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((task) => task.id === activeId)
                
                tasks[activeIndex].columnId = overId

                return arrayMove(tasks, activeIndex, activeIndex)
            })
            }
            
        
    }
}

    function updateColumn(id:Id, title:string) {
        const newColumns = columns.map((col) => {
            if (col.id !== id)return col
            return {...col, title}})
        setColumns(newColumns)
        }

    function deleteColumn(id:Id) {
        const filteredColumns = columns.filter((col)=>col.id !== id)
        setColumns(filteredColumns)
        const newTasks = tasks.filter((task) => task.columnId !== id)
        setTasks(newTasks)
    }
    function deleteTask(id:Id) {
        const filteredTasks = tasks.filter((task)=>task.id !== id)
        setTasks(filteredTasks)
    }

    function createTask(columnId:Id) {
        const newTask : Task = {
            id: generateId(),
            columnId,
            content: `Task ${tasks.length +1}`
        }
        setTasks([...tasks, newTask])
    }
    function updateTask(id:Id, content:string) {
        const newTasks = tasks.map((task) => {
            if (task.id !== id) return task
            return {...task, content}

        })
        setTasks(newTasks)
    }
    function onDragStart(event: DragStartEvent) {
        console.log(event)
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column)
            return;
        }
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task)
            return;
        }
    }
    
}


export default KanbanBoard