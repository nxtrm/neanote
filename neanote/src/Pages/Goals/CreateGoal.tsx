import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { MdCancel } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/@/ui/button';
import PageContainer from '../../../components/PageContainer/PageContainer';
import { useTags } from '../Tags/useTags';
import { DatePicker } from '../Tasks/DatePicker/DatePicker';
import EditGoalsSkeleton from './EditGoalsSkeleton';
import Inputs from './FormComponents/Inputs';
import Milestones from './FormComponents/Milestones';
import { useGoals } from './useGoals';
import FormButtons from '../../../components/FormButtons/FormButtons';


function CreateGoal() {
  const {currentGoal, loading, validationErrors, pendingChanges, handleMilestoneCompletion, resetCurrentGoal,handleCreateGoal, handleUpdateGoal, handleAddMilestone, handleRemoveMilestone, updateCurrentGoal} = useGoals();
  const navigate = useNavigate();

  const [isValidationErrorsEmpty, setIsValidationErrorsEmpty] = useState(true);

  useEffect(() => {
    setIsValidationErrorsEmpty(
      Object.keys(validationErrors).every(key => !validationErrors[key])
    );
  }, [validationErrors]);

  const handleClose = () => {
      useGoals.setState({
        validationErrors: {},
      })
      useTags.setState({
        selectedTagIds: [],
      })
      resetCurrentGoal()
      navigate('/goals');
    };

    const handleSave = async () => {
        if (await handleCreateGoal()) {
          navigate('/goals/edit');
        };
    }
  
  if (loading) return <EditGoalsSkeleton/>

  if (!currentGoal) return null

  return (
    <>
      <div className='flex row justify-between'>
          <h1 className="text-2xl font-bold mb-4">Create Goal</h1>
          <div className='flex gap-2'>
              <DatePicker onDateChange={(date) => updateCurrentGoal('due_date', date)} data={currentGoal.due_date} includeTime={false} />
              <Button size='icon' onClick={handleClose}>
                  <MdCancel size={15} />
              </Button>
          </div>
      </div>
          <Inputs content={currentGoal.content} title={currentGoal.title}/>
      <div className="mb-3">
          <Milestones goal={currentGoal}/>
      </div>
      <div className='flex flex-row justify-between'>
          <Button size="sm"  className="gap-2 " onClick={handleAddMilestone}>
              <FaPlus /> Add Milestone
          </Button>
          <FormButtons 
           pendingChanges={pendingChanges} 
           isValidationErrorsEmpty={isValidationErrorsEmpty}
           loading={loading}
           handleSave={handleSave} 
          /> 
      </div>
    </>
  );
}

export default CreateGoal;