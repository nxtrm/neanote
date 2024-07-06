import React from 'react';
import { Separator } from '@radix-ui/react-separator';
import { Button } from '../../../components/@/ui/button';
import { FaRegTrashAlt, FaPlus } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import { Input } from '../../../components/@/ui/input';
import { Textarea } from '../../../components/@/ui/textarea';
import TagsDropdownMenu from '../Tags/components/TagsDropdownMenu';
import { DatePicker } from './DatePicker/DatePicker';
import { useTasks } from './useTasks';
import PageContainer from '../../../components/PageContainer/PageContainer';
import { useNavigate } from 'react-router-dom';
import { useTags } from '../Tags/useTags';

//Fix Tags dropdown menu
//Fix DatePicker not having information
//ensure that all temporary ocmponents like currentTask are wiped
//maybe add server querying

function EditTasks() {
  const {
    currentTask,
    setSection,
    updateCurrentTask,
    handleAddSubtask,
    handleRemoveSubtask,
    handleEditTask,
    handleSaveTask,
    handleDeleteTask,
  } = useTasks();
  const navigate = useNavigate();

  const handleClose = () => {
    useTasks.setState({
      currentTask: null,
      section: 'all tasks',
    })
    useTags.setState({
      selectedTagIds: [],
    })
    navigate('/tasks');
  };

  const handleSave = async () => {
    if (currentTask?.taskid === -1) {
      await handleSaveTask();
    } else {
      await handleEditTask();
    }
    navigate('/tasks');

  }

  return (
    <PageContainer>
      <div className='p-1'>
        {/* Navbar */}
        <div className='flex flex-row justify-between'>
          <p className='pl-1 text-2xl font-bold'>{currentTask?.taskid !== -1 ? 'Edit Task' : 'Create Task'}</p>
          {/* Date Picker */}
          <div className='flex flex-row gap-2'>
            <DatePicker onDateChange={(date) => updateCurrentTask('due_date', date)} data={currentTask?.due_date} includeTime={true} />
            <Button size='icon' onClick={handleClose}>
              <MdCancel size={15} />
            </Button>
          </div>
        </div>

        <div className='py-3'>
          <Separator />
        </div>

        {/* Title and tags */}
        <div className='flex flex-row items-center gap-2'>
          <Input
            className='border rounded-md w-full h-10 leading-tight focus:outline-none focus:shadow-outline'
            placeholder='Title'
            type='text'
            value={currentTask?.title || ''}
            onChange={(e) => updateCurrentTask('title', e.target.value)}
          />
          <TagsDropdownMenu onTagsSelected={() => console.log('selected')} />
        </div>

        {/* Input Field */}
        <div className='pt-3 rounded-md'>
          <Textarea
            value={currentTask?.content || ''}
            placeholder='Describe your task here'
            onChange={(e) => updateCurrentTask('content', e.target.value)}
          />
          {currentTask?.subtasks.map((subtask, index) => (
            <div key={subtask.subtaskid} className='flex pt-3 gap-2 items-center'>
              <Input type='text' value={subtask.description} onChange={(e) => updateCurrentTask('subtasks', currentTask.subtasks.map(st => st.subtaskid === subtask.subtaskid ? { ...st, description: e.target.value } : st))} />
              <Button onClick={() => handleRemoveSubtask(subtask.subtaskid)} variant='secondary' size='icon'>
                <FaRegTrashAlt />
              </Button>
            </div>
          ))}

{/* Footer */}
            <div className='flex py-3 justify-between'>
              <Button onClick={handleAddSubtask}>
                  <div className='flex flex-row items-center gap-2'>
                        <FaPlus /> 
                        Add Subtask
                      </div>
                    </Button>
                    <div className='flex flex-row gap-2'>
                        <Button variant="outline" onClick={() =>
                            handleDeleteTask(currentTask?.taskid, currentTask?.noteid)
                          
                            }>
                            Delete
                        </Button>
                        <Button onClick={handleSave}
                        >
                            Save
                        </Button>
                    </div>
                </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default EditTasks;
