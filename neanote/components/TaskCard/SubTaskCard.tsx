import React from 'react'
import { Subtask } from '../../src/api/types/taskTypes'
import CheckBox from '../CheckBox/CheckBox'
import { useTasks } from '../../src/Pages/Tasks/useTasks';

function SubTaskCard({ subtask }: { subtask: Subtask }) {
    const toggleSubtaskCompleted = () => {
        useTasks.getState().toggleSubtaskCompleted(subtask.id);
    };

  return (
    <div className={`gap-3 items-center flex flex-row rounded-xl`}>
        <CheckBox checked={subtask.completed} onChange={toggleSubtaskCompleted} />
        {subtask.description}
    </div>
  )
}

export default SubTaskCard