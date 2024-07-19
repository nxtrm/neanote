import React, { useEffect, useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import TagLabel from '../../components/TagLabel/TagLabel';
import { Task } from '../../src/api/types/taskTypes';
import { useTags } from '../../src/Pages/Tags/useTags';
import { useTasks } from '../../src/Pages/Tasks/useTasks';
import { Button } from '../@/ui/button';
import { Separator } from "../@/ui/separator";
import CheckBox from '../CheckBox/CheckBox';
import DateLabel from '../DateLabel/DateLabel';
import SkeletonCard from './SkeletonCard';
import SubTaskCard from './SubTaskCard';
import './TaskCard.css';


function TaskCard({ task }: { task: Task }) { 
  const {
      toggleTaskCompleted,
      setSection,
      loading,
    } = useTasks()

    const toggleCompleted = () => {
        toggleTaskCompleted(task.taskid);
    };
    const navigate = useNavigate()

    function handleEditClick(noteId) {
      setSection('edit');
      localStorage.setItem('currentTaskId', noteId.toString());
      navigate('/tasks/edit');
  }

    const [screenSize, setScreenSize] = useState('large'); // Default to large

    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth < 650) {
          setScreenSize('small');
        } else if (window.innerWidth >= 650 && window.innerWidth < 1024) {
          setScreenSize('medium');
        } else {
          setScreenSize('large');
        }
      };
  
      // Set initial size
      handleResize();
  
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    // Determine collapsed and compressed states based on screenSize
    const isDateCollapsed = screenSize === 'small';
    const isTagCompressed = screenSize !== 'large';
  

      
      if (loading) {
        return <SkeletonCard />;
      }
      
      return (
      <div className='p-3 w-full rounded-xl border-[2px]'>
        <div className='flex flex-row items-center gap-3 justify-between'>
          <div className='flex flex-row items-center gap-3'>
            <CheckBox checked={task.completed} onChange={toggleCompleted} />
            <h3 className="task-title">{task.title}</h3>
          </div>                                                       
          <div className='flex flex-row items-center gap-1'>
            {task.due_date  && <DateLabel collapsed={isDateCollapsed} date={task.due_date} />}
            {task.tags.map((tag, index) => (
              <TagLabel key={index} name={tag.name} color={tag.color} compressed={isTagCompressed}/>
            ))}
            <Button variant="ghost" size={"icon"} onClick={()=>handleEditClick(task.noteid)}><FaEdit/></Button>
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
      </div>
    );
  }
  
  export default TaskCard;