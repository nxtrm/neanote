import React, { useEffect } from 'react';
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


function EditGoals() {
  const {currentGoal, loading, pendingChanges, section, handleDeleteGoal, fetchGoal, handleMilestoneCompletion, resetCurrentGoal,handleCreateGoal, handleUpdateGoal, handleAddMilestone, handleRemoveMilestone, updateCurrentGoal} = useGoals();
  const navigate = useNavigate();

  useEffect(() => {
      const noteId = localStorage.getItem('currentGoalId');
      if (noteId) {
        fetchGoal(noteId);
        useTags.setState({
          selectedTagIds: 
          currentGoal.tags.map(tag => {
            return tag.tagid
          }),
        })
      }
      }, []);
    
  useEffect(() => {    
      const progress = calculateProgress();
      var next_milestone =  currentGoal.milestones
              .filter(milestone => !milestone.completed)
              .sort((a, b) => a.index - b.index)[0]},[currentGoal.milestones]) //recalculate progressbars on milestone change
  
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
        pendingChanges: false
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
                    <DatePicker onDateChange={(date) => updateCurrentGoal('due_date', new Date(date))} data={currentGoal.due_date} includeTime={false} />
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

            <div className='flex flex-row justify-between'>
                <Button size="sm"  className="gap-2 " onClick={handleAddMilestone}>
                        <FaPlus /> Add Milestone
                    </Button>
                  <div className='gap-2 flex flex-row'>

                  <DeleteDialog handleDelete={handleDelete}>
                    <Button variant="outline" >
                            Delete
                    </Button>
                  </DeleteDialog>
                <Button disabled={!pendingChanges} onClick={handleSave}>
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                  </div>
            </div>
        </div>
    </PageContainer>
  );
}

export default EditGoals;