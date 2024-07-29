import React, { useEffect } from 'react'
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

function EditHabits() {
  const {currentHabit, handleCreateHabit, handleUpdateHabit, fetchHabit, toggleCompletedToday, section, resetCurrentHabit, updateCurrentHabit, handleDeleteHabit} = useHabits();
  const navigate = useNavigate();

  useEffect(() => {
    const noteId = localStorage.getItem('currentGoalId');
    if (noteId) {
      fetchHabit(noteId);
      if (currentHabit && currentHabit.tags) {
        const mappedTagIds = currentHabit.tags.map(tag => tag.tagid);
        useTags.setState({
          selectedTagIds: mappedTagIds,
        });
      }
    }
    }, []);

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
    if (section === 'create') {
      handleCreateHabit();
    }
    else {
      handleUpdateHabit();
    }
    navigate('/habits')
  }

  if (!currentHabit) {
    return null;
  }

    return (
      <PageContainer>


          <div className='p-1'>
          {/* Navbar */}
          <div className='flex flex-row justify-between'>
            <p className='pl-1 text-2xl font-bold'>{section === "edit habit" ? 'Edit Habit' : 'Create Habit'}</p>
            {/* Date Picker */}
            <div className='flex flex-row gap-2'>
              <TimeSelector/>
              <Button size='icon' onClick={handleClose}>
                <MdCancel size={15} />
              </Button>
            </div>
          </div>
          <div className='flex flex-row items-center justify-between py-3 gap-2'>
            <div className='w-10'>
              <CheckBox checked={currentHabit.completed_today} disabled={currentHabit.completed_today} onChange={()=>toggleCompletedToday(currentHabit.habitid)} />
            </div>
            <Input
              className='border rounded-md w-full h-10 leading-tight focus:outline-none focus:shadow-outline'
              placeholder='Title'
              type='text'
              value={currentHabit?.title || ''}
              onChange={(e) => updateCurrentHabit('title', e.target.value)}
              />
            {/* <TagsDropdownMenu /> */}
          </div>
          <div>
          <Textarea
              value={currentHabit?.content || ''}
              placeholder='Describe your habit here'
              onChange={(e) => updateCurrentHabit('content', e.target.value)}
              />
          </div>
          <div className='flex flex-col pt-3 gap-2'>
            {currentHabit?.linked_tasks ? currentHabit.linked_tasks.map((task) => {
              return (
                <TaskCard key={task.taskid} task={task} />
              )
              
            }): null}
          </div>
            <div className='pt-3 flex justify-between'>
              <LinkTasks linked_tasks={currentHabit?.linked_tasks ? currentHabit.linked_tasks : []}/>
              <div className='flex gap-2'>
              <Button variant='outline' onClick={handleDelete}>Delete</Button>
              <Button onClick={handleSaveHabit}>Save</Button>
              </div>
            </div>
          </div>
          
      </PageContainer>
    ) 
  }


export default EditHabits