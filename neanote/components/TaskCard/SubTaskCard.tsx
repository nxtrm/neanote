import React from 'react'
import { Subtask } from '../../src/api/types/taskTypes'
import CheckBox from '../CheckBox/CheckBox'
import { useTasks } from '../../src/Pages/Tasks/useTasks';

function SubTaskCard({ subtask, taskId }: { subtask: Subtask, taskId:number }) {
  const {
    toggleSubtaskCompleted
  } = useTasks()

    const toggleCompleted = () => {
        toggleSubtaskCompleted(subtask.id, taskId);
    };

  return (
    <div className={`gap-3 items-center flex flex-row rounded-xl`}>
        <CheckBox checked={subtask.completed} onChange={toggleCompleted} />
        {subtask.description}
    </div>
  )
}

export default SubTaskCard