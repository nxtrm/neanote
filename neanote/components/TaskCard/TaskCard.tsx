import React from 'react'
import { TaskPreview } from '../../src/api/types/taskTypes'
import CheckBox from '../CheckBox/CheckBox';
import SubTaskCard from './SubTaskCard';
import { Separator } from "../@/ui/separator";
import { Button } from '../@/ui/button';
import { FaEdit } from 'react-icons/fa';
import { useTasks } from '../../src/Pages/Tasks/useTasks';
import { Link, useNavigate } from 'react-router-dom';
import { Label } from '@radix-ui/react-dropdown-menu';
import { useTags } from '../../src/Pages/Tags/useTags';



function TaskCard({ task }: { task: TaskPreview }) {
    const {
      toggleTaskCompleted,
      setSection,
      setCurrentTask,
    } = useTasks()

    const {
      selectedTagIds,
      setSelectedTagIds,
    } = useTags();

    const toggleCompleted = () => {
        toggleTaskCompleted(task.taskid);
    };
    const navigate = useNavigate()

    const handleEditClick = (task: TaskPreview) => {
      setCurrentTask(task);
      setSection('edit');
      navigate('/tasks/edit');
    };

    
      function formatDateWithTime(dateInput: string | Date | undefined): string {
        if (!dateInput) return 'No due date';
        let date: Date;
        if (typeof dateInput === 'string') {
          date = new Date(dateInput);
        } else if (dateInput instanceof Date) {
          date = dateInput;
        } else {
          return 'Invalid date';
        }
        return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }).format(date);
      }
  
      const isOverdue = (dateString: string | undefined) => {
        if (!dateString) return false;
        // Parse the dateString into a Date object
        const date = new Date(dateString);
        return date < new Date();
      };
  
    return (
      <div className='p-4 w-full rounded-xl border-[2px]'>
        <div className='flex flex-row items-center gap-3 justify-between'>
          <div className='flex flex-row items-center gap-3'>
            <CheckBox checked={task.completed} onChange={toggleCompleted} />
            <h3 className="text-xl font-bold">{task.title}</h3>
          </div>
          <div className='flex flex-row items-center gap-3'>
            {task.due_date &&<div className={`text-xs  items-center p-1 rounded-md ${isOverdue(formatDateWithTime(task.due_date)) ? 'bg-red-400' : 'bg-secondary'}`}>
             Due: {formatDateWithTime(task.due_date)}
            </div>}
            {task.tags.map((tag, index) => (
              <Label key={index} style={{backgroundColor: tag.color}} className='rounded-md font-bold items-center bg-secondary text-white text-xs p-1'>{tag.name}</Label>

            ))}
            <Button variant="ghost" size={"icon"} onClick={()=>handleEditClick(task)}><FaEdit/></Button>
          </div>
        </div>
        {task.content && <p className="text-md pl-1 pt-2">{task.content}</p>}
        
        {task.subtasks.length > 0 && 
        <div className='pt-2'>
            <Separator />
        </div>}
        
        {task.subtasks.map((subtask) => (
            <div className='pt-2' key={subtask.subtask_id}>
              <SubTaskCard subtask={subtask} taskId={task.taskid}/>
            </div>
        ))}

        {/* <div className="flex flex-wrap gap-2 mt-2">
          {task.tags.map((tag, index) => (
            <span key={index} className="bg-blue-200 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div> */}
      </div>
    );
  }
  
  export default TaskCard;