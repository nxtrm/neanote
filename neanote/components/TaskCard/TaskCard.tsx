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
import SkeletonCard from './SkeletonCard';
import './TaskCard.css'; 
import TagLabel from '../../components/TagLabel/TagLabel';
import DateLabel from '../DateLabel/DateLabel';


function TaskCard({ task }: { task: TaskPreview }) {
    const {
      toggleTaskCompleted,
      setSection,
      setCurrentTask,
      loading,
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
      setSelectedTagIds(task.tags.map(tag => tag.tagid));
      setSection('edit');
      navigate('/tasks/edit');
    };

    

  

      
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
          <div className='flex flex-row items-center gap-3'>
            {task.due_date  && <DateLabel date={task.due_date} />}
            {task.tags.map((tag, index) => (
              
              <TagLabel key={index} name={tag.name} color={tag.color} compressed={false}/>
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