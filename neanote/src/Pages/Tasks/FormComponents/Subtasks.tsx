import { useMemo } from "react";
import { Task } from "../../../api/types/taskTypes";
import { arrayMove, SortableContext, useSortable } from "@dnd-kit/sortable";
import { DndContext, closestCenter } from "@dnd-kit/core";
import React from "react";
import { MdDragIndicator } from "react-icons/md";
import CheckBox from "../../../../components/CheckBox/CheckBox";
import { Input } from "../../../../components/@/ui/input";
import { Button } from "../../../../components/@/ui/button";
import { FaRegTrashAlt } from "react-icons/fa";
import { useTasks } from "../useTasks";
import { CSS } from '@dnd-kit/utilities';

function Subtasks({ task }: { task: Task }) {
    const subtasksId = useMemo(() => task.subtasks.map((st) => st.subtaskid), [task.subtasks]);
    const {updateCurrentTask,section, handleRemoveSubtask, toggleSubtaskCompleted} = useTasks();
  
    const onDragEnd = (event) => {
      const { active, over } = event;
      if (active.id !== over.id) {
        const oldIndex = subtasksId.indexOf(active.id);
        const newIndex = subtasksId.indexOf(over.id);
        const newSubtasks = arrayMove(task.subtasks, oldIndex, newIndex).map((subtask, index) => ({
          ...subtask,
          index,
        }));
        updateCurrentTask('subtasks', newSubtasks);
      }
    };
  
    return (
      <DndContext onDragEnd={onDragEnd} collisionDetection={closestCenter}>
        <SortableContext items={subtasksId}>
          {task.subtasks
            .slice()
            .sort((a, b) => a.index - b.index)
            .map((subtask) => (
              <SortableItem
                key={subtask.subtaskid}
                task={task}
                subtask={subtask}
                section = {section}
                handleRemoveSubtask={handleRemoveSubtask}
                toggleSubtaskCompleted={toggleSubtaskCompleted}
                updateCurrentTask={updateCurrentTask}

              />
            ))}
        </SortableContext>
      </DndContext>
    );
  }
  
  function SortableItem({ task, subtask, section, handleRemoveSubtask, toggleSubtaskCompleted, updateCurrentTask }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: subtask.subtaskid });
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
  
    return (
      <div ref={setNodeRef} style={style} {...attributes} className="flex pt-3 gap-2 items-center">
        <MdDragIndicator size={"25px"} className="cursor-grab mr-1" {...listeners} />
        <CheckBox
          checked={subtask.completed}
          onChange={() => toggleSubtaskCompleted(subtask.subtaskid, task.taskid)}
        />
        <Input
          id="subtask"
          name="Subtask description*"
          required
          type="text"
          value={subtask.description}
          onChange={(e) =>
            updateCurrentTask('subtasks', task.subtasks.map((st) =>
              st.subtaskid === subtask.subtaskid ? { ...st, description: e.target.value } : st
            ))
          }
        />
        <Button onClick={() => handleRemoveSubtask(subtask.subtaskid)} variant="secondary" size="icon">
          <FaRegTrashAlt />
        </Button>
      </div>
    );
  }
  
  export default Subtasks;

