import React, { useEffect, useState } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/@/ui/button';
import { Input } from '../../../components/@/ui/input';
import CheckBox from '../../../components/CheckBox/CheckBox';
import DeleteDialog from '../../../components/DeleteDialog/DeleteDialog';
import PageContainer from '../../../components/PageContainer/PageContainer';
import { useTags } from '../Tags/useTags';
import { DatePicker } from './DatePicker/DatePicker';
import EditTasksSkeleton from './EditTasksSkeleton';
import FormInputs from './FormComponents/FormInputs';
import { useTasks } from './useTasks';
import {Label} from '../../../components/@/ui/label';

function EditTasks() {
  const {
    currentTask,
    pendingChanges,
    loading,
    fetchTask,
    updateCurrentTask,
    handleAddSubtask,
    handleRemoveSubtask,
    handleEditTask,
    handleDeleteTask,
    toggleTaskCompleted,
    toggleSubtaskCompleted,
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
  }, [fetchTask]);

  useEffect(() => {
    setIsValidationErrorsEmpty(
      Object.keys(validationErrors).every((key) => !validationErrors[key])
    );

  }, [validationErrors]);


  const handleClose = () => {
    localStorage.removeItem('currentTaskId');
    resetCurrentTask();
    navigate('/tasks');
  };

  const handleSave = async () => {
    await handleEditTask();
    navigate('/tasks');
  };

  const handleDelete = async () => {
    await handleDeleteTask(currentTask?.taskid, currentTask?.noteid);
    navigate('/tasks');
  };

  if (loading) return <EditTasksSkeleton />;

  if (!currentTask) return null;

  return (
    <PageContainer>
      <div className="p-1">
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

        <FormInputs title={currentTask.title} content={currentTask.content} />
        {validationErrors['title'] && (
          <Label className="text-destructive">{validationErrors['title']}</Label>
        )}
        {validationErrors['content'] && (
          <Label className="text-destructive">{validationErrors['content']}</Label>
        )}

        <div className="rounded-md">
          {currentTask.subtasks
            .slice()
            .sort((a, b) => a.index - b.index)
            .map((subtask) => (
              <div key={subtask.subtaskid} className="flex pt-3 gap-2 items-center">
                <CheckBox
                  checked={subtask.completed}
                  onChange={() => toggleSubtaskCompleted(subtask.subtaskid, currentTask.taskid)}
                />
                <Input
                  type="text"
                  value={subtask.description}
                  onChange={(e) =>
                    updateCurrentTask('subtasks', currentTask.subtasks.map((st) =>
                      st.subtaskid === subtask.subtaskid ? { ...st, description: e.target.value } : st
                    ))
                  }
                />
                <Button onClick={() => handleRemoveSubtask(subtask.subtaskid)} variant="secondary" size="icon">
                  <FaRegTrashAlt />
                </Button>
              </div>
            ))}
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
            <div className="flex flex-row gap-2">
              <DeleteDialog handleDelete={handleDelete}>
                <Button variant="outline">Delete</Button>
              </DeleteDialog>
              <Button disabled={!pendingChanges || !isValidationErrorsEmpty} onClick={handleSave}>
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
