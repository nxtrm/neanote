import React, { useEffect, useState } from 'react';
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
import CheckBox from '../../../components/CheckBox/CheckBox';
import FormInputs from './FormComponents/FormInputs';
import { Label } from '../../../components/@/ui/label';

function CreateTask() {
  const {
    currentTask,
    section,
    toggleTaskCompleted,
    pendingChanges, loading,
    toggleSubtaskCompleted,
    fetchTask,
    updateCurrentTask,
    handleAddSubtask,
    handleRemoveSubtask,
    resetCurrentTask,
    handleEditTask,
    validationErrors,
    handleSaveTask,
    handleDeleteTask,
  } = useTasks();
  const navigate = useNavigate();

  const [isValidationErrorsEmpty, setIsValidationErrorsEmpty] = useState(true);

  useEffect(() => {
    setIsValidationErrorsEmpty(
      Object.keys(validationErrors).every(key => !validationErrors[key])
    );
  }, [validationErrors]);


  const handleClose = () => {
    localStorage.removeItem('currentTaskId');
    resetCurrentTask();
    navigate('/tasks');
  };

  const handleSave = async () => {
    await handleSaveTask();
    navigate('/tasks/edit');
  }

  const handleDelete = async () => {
    await handleDeleteTask(currentTask.taskid, currentTask.noteid)
    navigate('/tasks');
  }

  const toggleCompleted = () => {
    if (currentTask) {
      toggleTaskCompleted(currentTask.taskid);
    }

    };
  if (!currentTask) {
    return null
  }

  if (currentTask) {
  return (
    <PageContainer>
      <div className='p-1'>
        {/* Navbar */}
        <div className='flex flex-row justify-between'>
          <p className='pl-1 text-2xl font-bold'>Create Task</p>
          {/* Date Picker */}
          <div className='flex flex-row gap-2'>
            <DatePicker onDateChange={(date) => updateCurrentTask('due_date',date)} data={currentTask.due_date} includeTime={true} />
            <Button size='icon' onClick={handleClose}>
              <MdCancel size={15} />
        </Button>
          </div>
        </div>


        {/* Title and tags */}
          <FormInputs title={currentTask.title} content={currentTask.content} />
          {validationErrors['title'] && (
            <Label className='text-destructive'>{validationErrors['title']}</Label>
          )}
          {validationErrors['content'] && (
            <Label className='text-destructive'>{validationErrors['content']}</Label>
          )}

          {currentTask?.subtasks
            .slice()
            .sort((a, b) => a.index - b.index)
            .map((subtask, index) => (
                <div key={subtask.subtaskid} className='flex pt-2 gap-2 items-center'>
                <Input type='text' value={subtask.description} onChange={(e) => updateCurrentTask('subtasks', currentTask.subtasks.map(st => st.subtaskid === subtask.subtaskid ? { ...st, description: e.target.value } : st))} />
                <Button onClick={() => handleRemoveSubtask(subtask.subtaskid)} variant='secondary' size='icon'>
                    <FaRegTrashAlt />
                </Button>
                </div>
          ))}

          {/* Footer */}
          {validationErrors['subtasks'] && (
            <Label className='text-destructive'>{validationErrors['subtasks']}</Label>
          )}
            <div className='flex pt-2 justify-between'>
              <Button onClick={handleAddSubtask}>
                  <div className='flex flex-row items-center gap-2'>
                        <FaPlus /> 
                        Add Subtask
                      </div>
                    </Button>
                    <Button disabled={!pendingChanges||!isValidationErrorsEmpty} onClick={handleSave}>
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                    
                </div>
        </div>
    </PageContainer>
  );
}
}

export default CreateTask;
