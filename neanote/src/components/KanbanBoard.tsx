import { useMemo, useState } from "react"
import { Column, Id, Task } from "../types"
import { FaPlusCircle } from "react-icons/fa";
import ColumnContainer from "./ColumnContainer";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

function KanbanBoard() {
    const [columns, setColumns] = useState<Column[]>([])
    const columnsId = useMemo(()=>columns.map((col)=>col.id),[columns])
    const[activeColumn, setActiveColumn] = useState<Column | null>(null)

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
        <DndContext sensors={sensors} onDragEnd={onDragEnd} onDragStart={onDragStart} >

            <div className="m-auto flex gap-6">
                <div className="flex gap-4">
                    <SortableContext items={columnsId}>

                    {columns.map(column => <div>{
                        <ColumnContainer 
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
                {activeColumn && <ColumnContainer deleteTask={deleteTask} tasks={tasks.filter((task) => task.columnId === activeColumn.id)} createTask={createTask} column={activeColumn} updateColumn={updateColumn} deleteColumn={deleteColumn}/> }
            </DragOverlay>, document.body)}
        </DndContext>
    </div>
)
    function onDragEnd(event: DragEndEvent) {
        const{active,over} = event
        if(!over) return
        const activeColumnId =active.id
        const overColumnId = over.id
        if (activeColumnId === overColumnId) return

        setColumns((columns) => {
            const activeColumnIndex = columns.findIndex((col) => col.id === activeColumnId)
            const overColumnIndex = columns.findIndex((col) => col.id === overColumnId)
            return arrayMove(columns, activeColumnIndex, overColumnIndex)
        })
    }
    function createNewColumn() {
        const columnToAdd:Column = {
            id: generateId(),
            title: `Column ${columns.length +1}`
        }
        setColumns([...columns, columnToAdd])
        
    }
    function generateId() {
        return Math.floor(Math.random() * 10000)
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
    function onDragStart(event: DragStartEvent) {
        console.log(event)
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column)
            return;
    }
    
}}


export default KanbanBoard