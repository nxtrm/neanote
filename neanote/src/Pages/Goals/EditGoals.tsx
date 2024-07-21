import React, { useEffect, useState } from 'react'
import PageContainer from '../../../components/PageContainer/PageContainer'
import { Milestone } from '../../api/types/goalTypes';
import { Button } from '../../../components/@/ui/button';
import { FaPlus } from 'react-icons/fa6';
import { FaRegTrashAlt } from 'react-icons/fa';
import { Input } from '../../../components/@/ui/input';
import { Label } from '../../../components/@/ui/label';
import { useGoals } from './useGoals';
import TagsDropdownMenu from '../Tags/components/TagsDropdownMenu';
import { DatePicker } from '../Tasks/DatePicker/DatePicker';
import { MdCancel } from 'react-icons/md';
import { useTags } from '../Tags/useTags';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '../../../components/@/ui/textarea';
import DeleteDialog from '../../../components/DeleteDialog/DeleteDialog';
import EditGoalsSkeleton from './EditGoalsSkeleton';


function EditGoals() {
    const {currentGoal, loading, section, fetchGoal, resetCurrentGoal,handleCreateGoal, handleUpdateGoal, handleAddMilestone, handleRemoveMilestone, updateCurrentGoal} = useGoals();
    const navigate = useNavigate();

    useEffect(() => {
        const noteIdStr = localStorage.getItem('currentGoalId');
        if (noteIdStr) {
          const noteId = parseInt(noteIdStr, 10); 
          fetchGoal(noteId);
          useTags.setState({
            selectedTagIds: [],
          })
        }
      }, []);

    const handleClose = () => {
        localStorage.removeItem('currentGoalId');
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
        if (currentGoal?.goalid === -1) {
          await handleCreateGoal();
        } else {
          await handleUpdateGoal();
        }
        navigate('/goals');
      }
    
      const handleDelete = async () => {
        // await handleDeleteGoal(currentGoal?.goalid, currentGoal?.noteid)
        navigate('/goals');
      }
    if (loading) return <EditGoalsSkeleton/>

    return (
        <PageContainer>
            <div className="p-2">
                <div className='flex row justify-between'>

                    <h1 className="text-2xl font-bold mb-4">{section == "edit goal" ? 'Edit Goal' : 'Create Goal'}</h1>
                    <div className='flex gap-2'>
                        <DatePicker onDateChange={(date) => updateCurrentGoal('due_date', new Date(date))} data={currentGoal.due_date} includeTime={false} />
                        <Button size='icon' onClick={handleClose}>
                            <MdCancel size={15} />
                        </Button>
                    </div>
                </div>
                <Label className="block mb-2">Title</Label>
                <div className="flex flex-row gap-2 ">

  
                    <Input
                        type="text"
                        value={currentGoal?.title}
                        onChange={(e) => updateCurrentGoal('title', e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    <TagsDropdownMenu/>
                </div>
                <div className='py-2'>

                        <Textarea
                            value={currentGoal.content}
                            placeholder='Describe your task here'
                            onChange={(e) => updateCurrentGoal('content', e.target.value)}
                            />
                </div>

                <div className="mb-4">
                  <Label className="block mb-2">Milestones</Label>
                    {currentGoal?.milestones.map((milestone) => (
                        <div key={milestone.milestoneid} className="flex w-full items-center mb-2">
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
                    <Button size="sm"  className="gap-2 mt-2" onClick={handleAddMilestone}>
                            <FaPlus /> Add Milestone
                        </Button>
                      <div className='gap-2 flex flex-row'>
                    {section == "edit goal" && 
                      <DeleteDialog handleDelete={handleDelete}>
                        <Button variant="outline" >
                                Delete
                        </Button>
                      </DeleteDialog>}
                    <Button onClick={handleSave}>
                        Save
                    </Button>
                      </div>
                </div>
            </div>
        </PageContainer>
    );
}

export default EditGoals;