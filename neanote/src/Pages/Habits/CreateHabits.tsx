import React, { useEffect, useState } from 'react';
import { MdCancel } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/@/ui/button';
import PageContainer from '../../../components/PageContainer/PageContainer';
import TaskCard from '../../../components/TaskCard/TaskCard';
import { useTags } from '../Tags/useTags';
import Inputs from './FormComponents/Inputs';
import LinkTasks from './LinkTasks/LinkTasks';
import TimeSelector from './TimeSelector/TimeSelector';
import { useHabits } from './useHabits';

function CreateHabits() {
  const {currentHabit, handleCreateHabit, validationErrors, resetCurrentHabit, updateCurrentHabit} = useHabits();
  const navigate = useNavigate();

  const [isValidationErrorsEmpty, setIsValidationErrorsEmpty] = useState(true);

  useEffect(() => {
    setIsValidationErrorsEmpty(
      Object.keys(validationErrors).every(key => !validationErrors[key])
    );
  }, [validationErrors]);

  const handleClose = () => {
      useHabits.setState({
        section: 'all habits',
        pendingChanges: false,
        validationErrors: {},
      })
      useTags.setState({
        selectedTagIds: [],
      })
      resetCurrentHabit()
      navigate('/habits');
    };

  const handleSaveHabit = async () => {
      await handleCreateHabit();
      navigate('/goals/edit');
  }

    return (
      <PageContainer>
          <div className='p-1'>
          {/* Navbar */}
          <div className='flex flex-row justify-between'>
            <p className='pl-1 text-2xl font-bold'>Create Habit</p>
            {/* Date Picker */}
            <div className='flex flex-row gap-2'>
              <TimeSelector/>
              <Button size='icon' onClick={handleClose}>
                <MdCancel size={15} />
              </Button>
            </div>
          </div>
          <Inputs/>
          {currentHabit?.linked_tasks ?<div className='flex flex-col pt-3 gap-2'>
             {currentHabit.linked_tasks.map((task) => {
              return (
                <TaskCard key={task.taskid} task={task} />
              )
              
            })}
          </div>: null}
            <div className='pt-3 flex justify-between'>
              <LinkTasks linked_tasks={currentHabit?.linked_tasks ? currentHabit.linked_tasks : []}/>
              <div className='flex gap-2'>
              <Button onClick={handleSaveHabit}>Save</Button>
              </div>
            </div>
          </div>
          
      </PageContainer>
    ) 
  }


export default CreateHabits