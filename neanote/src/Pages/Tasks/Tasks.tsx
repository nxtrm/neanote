import React, { useEffect } from 'react';
import { Button } from '../../../components/@/ui/button';
import { FaPlus } from 'react-icons/fa';
import TaskCard from '../../../components/TaskCard/TaskCard';
import { useTasks } from './useTasks';
import PageContainer from '../../../components/PageContainer/PageContainer';
import { useNavigate } from 'react-router-dom';

const Tasks: React.FC = () => {
  const { tasks, setSection, fetchTasks, setCurrentTask } = useTasks();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTaskClick = () => {
    setCurrentTask({
        taskid: -1,
        noteid: -1,
        title: '',
        tags: [],
        content: '',
        subtasks: [],
        due_date: undefined,
        completed: false,
      });
    setSection('create');
    navigate('/tasks/create')
  };

  return (
    <PageContainer>
      <div className='px-1 py-1'>
        {/* Title and Button */}
        <div className='flex flex-row justify-between pb-2'>
          <p className='pl-1 text-2xl font-bold'>Tasks</p>
          <Button size='sm' onClick={handleAddTaskClick}>
            <FaPlus />
            Add Task
          </Button>
        </div>

        {/* Task List */}
        <div className='flex flex-col gap-3'>
          {tasks.map((task) => (
            <TaskCard key={task.taskid} task={task} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
};

export default Tasks;
