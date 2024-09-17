import React, { useEffect, useState } from 'react';
import { FaTasks } from "react-icons/fa";
import { FaPlus } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/@/ui/button';
import PaginationSelector from '../../../components/Pagination/PaginationSelector';
import TaskCard from '../../../components/TaskCard/TaskCard';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import { useTasks } from './useTasks';

const Tasks: React.FC = () => {
  const { tasks, fetchTaskPreviews, resetCurrentTask, nextPage, page } = useTasks();
  const navigate = useNavigate();

  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  useEffect(() => {
      const fetchIfNeeded = () => {
        // Check if never fetched or if 5 minutes have passed since the last fetch
        if (!lastFetchTime || new Date().getTime() - lastFetchTime.getTime() > 300000) {
          fetchTaskPreviews(page);
          setLastFetchTime(new Date());
        }
      };
  
      fetchIfNeeded();
  
      // Set up a timer to refetch every 5 minutes
      const intervalId = setInterval(fetchIfNeeded, 300000);
  
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchTaskPreviews, lastFetchTime]);

  const handleAddTaskClick = () => {
    resetCurrentTask();
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
        <PaginationSelector fetchingFunction={fetchTaskPreviews} nextPage={nextPage} page={page}/>
      </div>
    </>
  );
}; //TODO: pagination per_page

export default Tasks;
