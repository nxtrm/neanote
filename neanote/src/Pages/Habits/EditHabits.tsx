import React, { useEffect, useState } from 'react';
import { MdCancel } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/@/ui/button';
import DeleteDialog from '../../../components/DeleteDialog/DeleteDialog';
import PageContainer from '../../../components/PageContainer/PageContainer';
import TaskCard from '../../../components/TaskCard/TaskCard';
import { useTags } from '../Tags/useTags';
import EditHabitsSkeleton from './EditHabitsSkeleton';
import Inputs from './FormComponents/Inputs';
import LinkTasks from './LinkTasks/LinkTasks';
import TimeSelector from './TimeSelector/TimeSelector';
import { useHabits } from './useHabits';

function EditHabits() {
  const {currentHabit, handleCreateHabit, pendingChanges, validationErrors, handleUpdateHabit, loading, fetchHabit, toggleCompletedToday, section, resetCurrentHabit, updateCurrentHabit, handleDeleteHabit} = useHabits();
  const navigate = useNavigate();
  const [isValidationErrorsEmpty, setIsValidationErrorsEmpty] = useState(true);

  useEffect(() => {
    const noteId = localStorage.getItem('currentHabitId');
    if (noteId && currentHabit.isNew) {
      fetchHabit(noteId);
      if (currentHabit && currentHabit.tags) {
        const mappedTagIds = currentHabit.tags.map(tag => tag.tagid);
        useTags.setState({
          selectedTagIds: mappedTagIds,
        });
      }
    }
    }, []);

    useEffect(() => {
      console.log(validationErrors)
      setIsValidationErrorsEmpty(
        Object.keys(validationErrors).every(key => !validationErrors[key])
      );
    }, [validationErrors]);

    const handleClose = () => {
      localStorage.removeItem('currentHabitId');
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

  const handleDelete = async () => {
    await handleDeleteHabit(currentHabit.habitid, currentHabit.noteid)
    navigate('/habits');
  }

  const handleSaveHabit = () => {
      handleUpdateHabit();
  }

  if (loading) {
    return (
      <EditHabitsSkeleton/>
    )
  }

  if (!currentHabit) {
    return null;
  }

    return (
      <PageContainer>
        <div className='p-1'>
          {/* Navbar */}
          <div className='flex flex-row justify-between'>
            <p className='pl-1 text-2xl font-bold'>Edit Habit</p>
            {/* Date Picker */}
            <div className='flex flex-row gap-2'>
              <TimeSelector/>
              <Button size='icon' onClick={handleClose}>
                <MdCancel size={15} />
              </Button>
            </div>
          </div>
          <Inputs withChechbox/>
          {(currentHabit.linked_tasks.length > 0) && 
          <div className='flex pt-3 flex-col gap-2'>
             {currentHabit.linked_tasks.map((task) => {
              return (
                <TaskCard key={task.taskid} task={task} />
              )
              
            })}
          </div>}
            <div className=' flex mt-3 justify-between'>
              <LinkTasks linked_tasks={currentHabit.linked_tasks ? currentHabit.linked_tasks : []}/>
              <div className='flex gap-2'>
                <DeleteDialog handleDelete={handleDelete}>
                  <Button variant="outline">Delete</Button>
                </DeleteDialog>
                <Button disabled={!isValidationErrorsEmpty || !pendingChanges} onClick={handleSaveHabit}>Save</Button>
            </div>
            </div>
        </div>
      </PageContainer>
    ) 
  }


export default EditHabits