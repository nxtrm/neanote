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

const Tasks: React.FC = () => {
  const { tasks, setSection, fetchTaskPreviews, resetCurrentTask,  setCurrentTask, } = useTasks();
  const navigate = useNavigate();

  // const {
  //   data,
  //   error,
  //   fetchNextPage,
  //   hasNextPage,
   
  //   isFetching,
  //   isFetchingNextPage,
  //   status,
  // } = useInfiniteQuery({
  //   initialPageParam: 0,
  //   queryKey: ['tasks'],
  //   queryFn: async ({ pageParam}) =>  {
  //     const response = await tasksApi.getTaskPreviews(pageParam)
  //     return {
  //       pages: response.data, 
  //       nextPage: response.nextPage,
  //     };
  //   },
  //   getNextPageParam: (lastPage, allPages) => lastPage.nextPage,
  // });

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
          <p className="pl-2 text-2xl flex-row flex items-center gap-3 font-bold"><FaTasks size={'20px'}/> Tasks</p>
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
    </PageContainer>
  );
};

export default Tasks;
