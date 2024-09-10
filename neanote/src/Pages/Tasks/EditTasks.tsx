import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/@/ui/button';
import { Label } from '../../../components/@/ui/label';
import FormButtons from '../../../components/FormButtons/FormButtons';
import PageContainer from '../../../components/PageContainer/PageContainer';
import { DatePicker } from './DatePicker/DatePicker';
import EditTasksSkeleton from './EditTasksSkeleton';
import FormInputs from './FormComponents/FormInputs';
import Subtasks from './FormComponents/Subtasks';
import { useTasks } from './useTasks';

function EditTasks() {
  const {
    currentTask,
    pendingChanges,
    loading,
    fetchTask,
    updateCurrentTask,
    archive,
    handleAddSubtask,
    handleEditTask,
    handleDeleteTask,
    resetCurrentTask,
    validationErrors,
  } = useTasks();

  const navigate = useNavigate();
  const [isValidationErrorsEmpty, setIsValidationErrorsEmpty] = useState(true);

  useEffect(() => {
    const noteId = localStorage.getItem('currentTaskId');
    if (noteId) {
      fetchTask(noteId);
    }
  }, [fetchTask, localStorage.getItem('currentTaskId')]);

  useEffect(() => {
    setIsValidationErrorsEmpty(
      Object.keys(validationErrors).every((key) => !validationErrors[key])
    );
    console.log(validationErrors)

  }, [validationErrors]);


  const handleClose = () => {
    localStorage.removeItem('currentTaskId');
    resetCurrentTask();
    navigate('/tasks');
  };

  const handleSave = async () => {
    await handleEditTask();
  };

  const handleDelete = async () => {
    await handleDeleteTask(currentTask?.taskid, currentTask?.noteid);
    navigate('/tasks');
  };

  const handleArchive = async () => {
    await archive(currentTask?.noteid);
    navigate('/tasks');
  }

  if (loading) return <EditTasksSkeleton />;

  if (!currentTask) return null;

  return (
    <>
        <div className="flex flex-row justify-between">
          <p className="pl-1 text-2xl font-bold">Edit Task</p>
          <div className="flex flex-row gap-2">
            <DatePicker
              onDateChange={(date) => updateCurrentTask('due_date', date)}
              data={currentTask.due_date}
              includeTime={true}
            />
            <Button size="icon" onClick={handleClose}>
              <MdCancel size={15} />
            </Button>
          </div> 
        </div>
        
        <FormInputs title={currentTask.title} content={currentTask.content} validationErrors={validationErrors} withCheckBox/>

        <div className="rounded-md">
          <Subtasks task={currentTask}/>
          {validationErrors['subtasks'] && (
            <Label className="text-destructive">{validationErrors['subtasks']}</Label>
          )}
          <div className="flex py-3 justify-between">
            <Button onClick={handleAddSubtask}>
              <div className="flex flex-row items-center gap-2">
                <FaPlus />
                Add Subtask
              </div>
            </Button>
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
        </div>
    </>
  );
}

export default EditTasks;
