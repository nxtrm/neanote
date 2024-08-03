import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { MdCancel } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/@/ui/button';
import { Progress } from '../../../components/@/ui/progress';
import DeleteDialog from '../../../components/DeleteDialog/DeleteDialog';
import PageContainer from '../../../components/PageContainer/PageContainer';
import { useTags } from '../Tags/useTags';
import { DatePicker } from '../Tasks/DatePicker/DatePicker';
import EditGoalsSkeleton from './EditGoalsSkeleton';
import Inputs from './FormComponents/Inputs';
import Milestones from './FormComponents/Milestones';
import { useGoals } from './useGoals';
import { Label } from '../../../components/@/ui/label';
import FormButtons from '../../../components/FormButtons/FormButtons';


function EditGoals() {
  const {currentGoal, loading, pendingChanges, archive, validationErrors,  handleDeleteGoal, fetchGoal, resetCurrentGoal,handleUpdateGoal, handleAddMilestone,updateCurrentGoal} = useGoals();
  const navigate = useNavigate();

  useEffect(() => {
      const noteId = localStorage.getItem('currentGoalId');
      if (noteId) {
        fetchGoal(noteId);
        if (currentGoal.tags) {
          const mappedTagIds = currentGoal.tags.map(tag => tag.tagid);
          useTags.setState({
            selectedTagIds: mappedTagIds,
          });
        }
      }
      }, []);
  
  const [isValidationErrorsEmpty, setIsValidationErrorsEmpty] = useState(true);

  useEffect(() => {
      setIsValidationErrorsEmpty(
        Object.keys(validationErrors).every(key => !validationErrors[key])
      );
  }, [validationErrors]);

  const handleArchive = async () => {
    await archive(currentGoal?.noteid);
    navigate('/goals');
  }
            
  
 const calculateProgress = () => {
      const sortedMilestones = [...currentGoal.milestones].sort((a, b) => a.index - b.index);
      const completedMilestones = sortedMilestones.filter(milestone => milestone.completed).length;
      return (completedMilestones / sortedMilestones.length) * 100;
      };

  const progress = calculateProgress();

  const handleClose = () => {
      localStorage.removeItem('currentGoalId');
      useGoals.setState({
        section: 'all goals',
        pendingChanges: false,
        validationErrors: {},
      })
      useTags.setState({
        selectedTagIds: [],
      })
      resetCurrentGoal()
      navigate('/goals');
    };

    const handleSave = async () => {
        await handleUpdateGoal();
    }

    const handleDelete = async () => {
      await handleDeleteGoal(currentGoal?.goalid, currentGoal?.noteid)
      navigate('/goals');
    }
    
  if (loading) return <EditGoalsSkeleton/>

  return (
    <PageContainer>
      <div className="p-2">
        <div className='flex row justify-between'>
            <h1 className="text-2xl font-bold mb-4">Edit Goal</h1>
            <div className='flex gap-2'>
                <DatePicker onDateChange={(date) => updateCurrentGoal('due_date', date)} data={currentGoal.due_date} includeTime={false} />
                <Button size='icon' onClick={handleClose}>
                    <MdCancel size={15} />
                </Button>
            </div>
        </div>
            <Inputs content={currentGoal.content} title={currentGoal.title}/>
        <div className="mb-3">
            <Progress className='rounded-sm mb-3' value={progress}/>
            <Milestones goal={currentGoal}/>
        </div>
        {validationErrors['milestones'] && (
              <Label className='text-destructive'>{validationErrors['milestones']}</Label>
            )}
        <div className='flex flex-row justify-between'>
            <Button size="sm"  className="gap-2 " onClick={handleAddMilestone}>
                    <FaPlus /> Add Milestone
                </Button>
              <div className='gap-2 flex flex-row'>
              <FormButtons 
                pendingChanges={pendingChanges} 
                isValidationErrorsEmpty={isValidationErrorsEmpty}
                loading={loading}
                hasDelete 
                handleSave={handleSave} 
                handleArchive={handleArchive} 
                handleDelete={handleDelete} 
              />
              </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default EditGoals;