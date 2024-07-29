import React, { useEffect, useState } from 'react'
import PageContainer from '../../../components/PageContainer/PageContainer'
import { Button } from '../../../components/@/ui/button'
import { MdCancel } from 'react-icons/md'
import { useHabits } from './useHabits';
import { useTags } from '../Tags/useTags';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/@/ui/input';
import TagsDropdownMenu from '../Tags/components/TagsDropdownMenu';
import { Textarea } from '../../../components/@/ui/textarea';
import TimeSelector from './TimeSelector/TimeSelector';
import LinkTasks from './LinkTasks/LinkTasks';
import TaskCard from '../../../components/TaskCard/TaskCard';
import CheckBox from '../../../components/CheckBox/CheckBox';
import EditHabitsSkeleton from './EditHabitsSkeleton';
import { Label } from '../../../components/@/ui/label';
import Inputs from './FormComponents/Inputs';

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
            <p className='pl-1 text-2xl font-bold'>{section === "edit" ? 'Edit Habit' : 'Create Habit'}</p>
            {/* Date Picker */}
            <div className='flex flex-row gap-2'>
              <TimeSelector/>
              <Button size='icon' onClick={handleClose}>
                <MdCancel size={15} />
              </Button>
            </div>
          </div>
          <Inputs withChechbox/>
          {currentHabit?.linked_tasks ? <div className='flex flex-col pt-3 gap-2'>
             {currentHabit.linked_tasks.map((task) => {
              return (
                <TaskCard key={task.taskid} task={task} />
              )
              
            })}
          </div>: null}
            <div className=' flex justify-between'>
              <LinkTasks linked_tasks={currentHabit?.linked_tasks ? currentHabit.linked_tasks : []}/>
              <div className='flex gap-2'>
                <Button variant='outline' onClick={handleDelete}>Delete</Button>
                <Button disabled={!isValidationErrorsEmpty || !pendingChanges} onClick={handleSaveHabit}>Save</Button>
            </div>
            </div>
          </div>
          
      </PageContainer>
    ) 
  }


export default EditHabits