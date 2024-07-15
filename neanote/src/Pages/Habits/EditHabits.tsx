import React from 'react'
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

function EditHabits() {
  const {currentHabit, handleCreateHabit, handleUpdateHabit, setSection, section, setCurrentHabit, updateCurrentHabit, handleDelete} = useHabits();
  const navigate = useNavigate();

  const handleClose = () => {
    useHabits.setState({
      currentHabit: null,
      section: 'all habits',
    })
    useTags.setState({
      selectedTagIds: [],
    })
    navigate('/habits');
  };

  const handleSaveHabit = () => {
    if (section === 'create') {
      handleCreateHabit();
    }
    else {
      handleUpdateHabit();
    }
    navigate('/habits')
  }

  return (
    <PageContainer>
        <div className='p-1'>
        {/* Navbar */}
        <div className='flex flex-row justify-between'>
          <p className='pl-1 text-2xl font-bold'>{currentHabit?.habitid !== -1 ? 'Edit Habit' : 'Create Habit'}</p>
          {/* Date Picker */}
          <div className='flex flex-row gap-2'>
            <TimeSelector/>
            <Button size='icon' onClick={handleClose}>
              <MdCancel size={15} />
            </Button>
          </div>
        </div>
        <div className='flex flex-row items-center py-3 gap-2'>
          <Input
            className='border rounded-md w-full h-10 leading-tight focus:outline-none focus:shadow-outline'
            placeholder='Title'
            type='text'
            value={currentHabit?.title || ''}
            onChange={(e) => updateCurrentHabit('title', e.target.value)}
          />
          <TagsDropdownMenu onTagsSelected={() => console.log('selected')} />
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