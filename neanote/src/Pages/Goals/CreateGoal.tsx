import React, { useEffect } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa6';
import { MdCancel } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/@/ui/button';
import { Input } from '../../../components/@/ui/input';
import { Progress } from '../../../components/@/ui/progress';
import { Textarea } from '../../../components/@/ui/textarea';
import CheckBox from '../../../components/CheckBox/CheckBox';
import DeleteDialog from '../../../components/DeleteDialog/DeleteDialog';
import PageContainer from '../../../components/PageContainer/PageContainer';
import TagsDropdownMenu from '../Tags/components/TagsDropdownMenu';
import { useTags } from '../Tags/useTags';
import { DatePicker } from '../Tasks/DatePicker/DatePicker';
import EditGoalsSkeleton from './EditGoalsSkeleton';
import { useGoals } from './useGoals';


function CreateGoal() {
  const {currentGoal, loading, section, handleMilestoneCompletion, resetCurrentGoal,handleCreateGoal, handleUpdateGoal, handleAddMilestone, handleRemoveMilestone, updateCurrentGoal} = useGoals();
  const navigate = useNavigate();

  const handleClose = () => {
      useGoals.setState({
        section: 'all goals',
      })
      useTags.setState({
        selectedTagIds: [],
      })
      resetCurrentGoal()
      navigate('/goals');
    };

    const handleSave = async () => {
        await handleCreateGoal();
        navigate('/goals/edit');
    }
    
  if (loading) return <EditGoalsSkeleton/>

  return (
    <PageContainer>
        <div className="p-2">
            <div className='flex row justify-between'>
                <h1 className="text-2xl font-bold mb-4">Create Goal</h1>
                <div className='flex gap-2'>
                    <DatePicker onDateChange={(date) => updateCurrentGoal('due_date', new Date(date))} data={currentGoal.due_date} includeTime={false} />
                    <Button size='icon' onClick={handleClose}>
                        <MdCancel size={15} />
                    </Button>
                </div>
            </div>
            <div className="flex flex-row gap-2 ">
                <Input
                    type="text"
                    value={currentGoal?.title}
                    placeholder='Title'
                    onChange={(e) => updateCurrentGoal('title', e.target.value)}
                    className="w-full p-2 border rounded"
                />
                {/* <TagsDropdownMenu/> */}
            </div>
            <div className='pt-2 pb-3'>
                    <Textarea
                        value={currentGoal.content}
                        placeholder='Describe your goal here'
                        onChange={(e) => updateCurrentGoal('content', e.target.value)}
                        />
            </div>
            <div className="mb-3">
                {currentGoal?.milestones.map((milestone) => (
                  <div key={milestone.milestoneid} className="flex w-full items-center mb-2">
                            {section == "edit goal" &&
                                <div className='mr-2'>
                                  <CheckBox 
                                      checked={milestone.completed} 
                                      onChange={() => handleMilestoneCompletion(currentGoal.goalid, milestone.milestoneid)} />
                                </div>}
                                <Input
                                    type="text"
                                    value={milestone.description}
                                    onChange={(e) => updateCurrentGoal('milestones', currentGoal.milestones.map(ms => ms.milestoneid === milestone.milestoneid ? { ...ms, description: e.target.value } : ms))}
                                    placeholder={milestone.index === 0 || milestone.index === currentGoal?.milestones.length - 1   ? "Starting Point" : `Milestone ${milestone.index + 1}`}
                                    className="flex-grow p-2 border rounded mr-2"
                                />
                                <Button size="icon" variant={"secondary"} 
                                        disabled={
                                            milestone.index === 0 || // First item
                                            milestone.index === currentGoal?.milestones.length - 1 // Last item
                                          } 
                                        onClick={() => handleRemoveMilestone(milestone.milestoneid)}>
                                    <FaRegTrashAlt />
                                </Button>
                                        
                    </div>
                ))}
            </div>
            <div className='flex flex-row justify-between'>
                <Button size="sm"  className="gap-2 " onClick={handleAddMilestone}>
                        <FaPlus /> Add Milestone
                    </Button>
                  <div className='gap-2 flex flex-row'>
                <Button onClick={handleSave}>
                    Create
                </Button>
                  </div>
            </div>
        </div>
    </PageContainer>
  );
}

export default CreateGoal;