import React from 'react'
import { TaskPreview } from '../../src/api/types/taskTypes'



function TaskCard({ task }: { task: TaskPreview }) {
    function formatDate(dateInput: string | Date | undefined): string {
        if (!dateInput) return 'No due date';
        let date: Date;
        if (typeof dateInput === 'string') {
          date = new Date(dateInput);
        } else if (dateInput instanceof Date) {
          date = dateInput;
        } else {
          return 'Invalid date';
        }
        return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
      }
  
      const isOverdue = (dateString: string | undefined) => {
        if (!dateString) return false;
        // Parse the dateString into a Date object
        const date = new Date(dateString);
        return date < new Date();
      };
  
    return (
      <div className={`p-4 w-full flex flex-col rounded-xl border-[2px]`}>
        <h3 className="text-xl font-bold">{task.title}</h3>
        <p className="text-sm">{task.content}</p>
        <div className={`text-xs ${isOverdue(formatDate(task.due_date)) ? 'text-red-400' : 'text-gray-500'}`}>
          {task.due_date && `Due Date: ${formatDate(task.due_date)}`}
        </div>
        <ul className="list-disc pl-5">
          {task.subtasks.map((subtask) => (
            <li key={subtask.id} className={`${subtask.completed ? 'text-green-500' : 'text-gray-700'}`}>
              {subtask.description}
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