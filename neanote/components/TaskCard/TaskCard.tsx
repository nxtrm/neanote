import React from 'react'
import { TaskPreview } from '../../src/api/types/taskTypes'



function TaskCard({ task }: { task: TaskPreview }) {
    const formatDate = (date: Date | undefined) => {
      if (!date) return 'No due date';
      return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
    };
  
    const isOverdue = (date: Date | undefined) => {
      return date ? date < new Date() : false;
    };
  
    return (
      <div className={`p-4 w-full flex flex-col rounded-xl border-[2px]`}>
        <h3 className="text-xl font-bold">{task.taskTitle}</h3>
        <p className="text-sm">{task.content}</p>
        <div className={`text-xs ${isOverdue(task.dueDate) ? 'text-red-400' : 'text-gray-500'}`}>
          {task.dueDate && `Due Date: ${formatDate(task.dueDate)}`}
        </div>
        <ul className="list-disc pl-5">
          {task.subtasks.map((subtask) => (
            <li key={subtask.id} className={`${subtask.completed ? 'text-green-500' : 'text-gray-700'}`}>
              {subtask.text}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2 mt-2">
          {task.tags.map((tag, index) => (
            <span key={index} className="bg-blue-200 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }
  
  export default TaskCard;