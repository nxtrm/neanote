import React, { useEffect } from 'react';
import { FaTasks } from "react-icons/fa";
import { FaPlus } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/@/ui/button';
import PaginationSelector from '../../../components/Pagination/PaginationSelector';
import TaskCard from '../../../components/TaskCard/TaskCard';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import { useTasks } from './useTasks';

const Tasks: React.FC = () => {
  const { tasks, setSection, fetchTaskPreviews, resetCurrentTask, nextPage,  } = useTasks();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTaskPreviews(1);
  },[fetchTaskPreviews])

  const handleAddTaskClick = () => {
    resetCurrentTask();
    setSection('create');
    navigate('/tasks/create')
  };

  return (
    <>
      <div className="flex flex-row justify-between pb-2">
        <TitleComponent>
          <FaTasks size={'20px'} /> Tasks
        </TitleComponent>
        <Button size="sm" className="gap-2" onClick={handleAddTaskClick}>
          <FaPlus />
          Add Task
        </Button>
      </div>
      <div className="flex flex-col gap-3 flex-grow">
        {tasks.map((task) => (
          <TaskCard key={task.taskid} task={task} />
        ))}
      </div>
      <div className="p-1 pt-2">
        <PaginationSelector fetchingFunction={fetchTaskPreviews} nextPage={nextPage} />
      </div>
    </>
  );
}; //TODO: pagination per_page

export default Tasks;
