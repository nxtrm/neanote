import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/@/ui/button';
import { FaPlus} from 'react-icons/fa6';
import { FaTasks } from "react-icons/fa";
import TaskCard from '../../../components/TaskCard/TaskCard';
import { useTasks } from './useTasks';
import PageContainer from '../../../components/PageContainer/PageContainer';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query'
import tasksApi from '../../api/tasksApi';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import PaginationSelector from '../../../components/Pagination/PaginationSelector';

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
    <PageContainer>
      <div className="px-1 py-1">
        <div className="flex flex-row justify-between pb-2">
          <TitleComponent>
            <FaTasks size={'20px'}/> Tasks
          </TitleComponent>
          <Button size="sm" className="gap-2" onClick={handleAddTaskClick}>
            <FaPlus />
            Add Task
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskCard key={task.taskid} task={task} />
          ))}
          {/* {data?.pages.map((page, pageIndex) => (
            <React.Fragment key={pageIndex}>
              {page.pages.map((task) => (
                <TaskCard key={task.taskid} task={task} />
              ))}
            </React.Fragment>
          ))}
          {hasNextPage && (
            <Button
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading more...' : 'Load More'}
            </Button>
          )} */}
        </div>
      </div>
      <div className='p-1 pt-2'> 
        <PaginationSelector fetchingFunction={fetchTaskPreviews} nextPage={nextPage} />
      </div>
    </PageContainer>
  );
}; //TODO: pagination per_page

export default Tasks;
