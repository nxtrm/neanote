import React, { useEffect, useState } from 'react';
import { MdCancel } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/@/ui/button';
import FormButtons from '../../../components/FormButtons/FormButtons';
import TaskCard from '../../../components/TaskCard/TaskCard';
import { useTags } from '../Tags/useTags';
import EditHabitsSkeleton from './EditHabitsSkeleton';
import Inputs from './FormComponents/Inputs';
import LinkTasks from './LinkTasks/LinkTasks';
import TimeSelector from './TimeSelector/TimeSelector';
import { useHabits } from './useHabits';

function EditHabits() {
  const {currentHabit, archive, pendingChanges, validationErrors, handleUpdateHabit, loading, fetchHabit, resetCurrentHabit, handleDeleteHabit} = useHabits();
  const navigate = useNavigate();
  const [isValidationErrorsEmpty, setIsValidationErrorsEmpty] = useState(true);

  useEffect(() => {
    const noteId = localStorage.getItem('currentHabitId');
    if (noteId && currentHabit.isNew) {
      fetchHabit(noteId);
      if (currentHabit && currentHabit.tags) {
        const mappedTagIds = currentHabit.tags.map(tag => tag);
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

  const handleArchive = async () => {
      await archive(currentHabit?.noteid);
      navigate('/habits');
  }

  const handleDelete = async () => {
    await handleDeleteHabit(currentHabit.habitid, currentHabit.noteid)
    navigate('/habits');
  }

  const handleSave = () => {
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
      <>
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
              <FormButtons
                pendingChanges={pendingChanges}
                isValidationErrorsEmpty={isValidationErrorsEmpty}
                loading={loading}
                hasDelete
                handleSave={handleSave}
                handleArchive={handleArchive}
                handleDelete={handleDelete} //add this to all other forms
              />
            </div>
      </>
    )
  }


export default EditHabits