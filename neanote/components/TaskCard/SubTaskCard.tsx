import React from 'react'
import { Subtask } from '../../src/api/types/taskTypes'
import CheckBox from '../CheckBox/CheckBox'
import { useTasks } from '../../src/Pages/Tasks/useTasks';
import { UUID } from 'crypto';

function SubTaskCard({ subtask, taskId }: { subtask: Subtask, taskId:UUID}) {
  const {
    toggleSubtaskCompleted
  } = useTasks()

    const toggleCompleted = () => {
        toggleSubtaskCompleted(subtask.subtaskid, taskId);
        console.log(subtask)
    };

  return (
    <div className={`gap-3 items-center flex flex-row rounded-xl`}>
        <CheckBox checked={subtask.completed} onChange={toggleCompleted} />
        {subtask.description}
    </div>
  )
}

export default SubTaskCard