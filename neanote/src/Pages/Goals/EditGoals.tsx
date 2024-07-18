import React, { useState } from 'react'
import PageContainer from '../../../components/PageContainer/PageContainer'
import { Milestone } from '../../api/types/goalTypes';
import { Button } from '../../../components/@/ui/button';
import { FaPlus } from 'react-icons/fa6';
import { FaRegTrashAlt } from 'react-icons/fa';
import { Input } from '../../../components/@/ui/input';
import { Label } from '../../../components/@/ui/label';
import { useGoals } from './useGoals';
import TagsDropdownMenu from '../Tags/components/TagsDropdownMenu';


function EditGoals() {
    const {currentGoal, handleAddMilestone, handleRemoveMilestone, updateCurrentGoal} = useGoals();

    const [startingPoint, setStartingPoint] = useState('');
    const [endingPoint, setEndingPoint] = useState('');
    const [milestones, setMilestones] = useState<Milestone[]>([]);

    const handleSubmit = () => {
        // Handle form submission logic here
        console.log('Starting Point:', startingPoint);
        console.log('Ending Point:', endingPoint);
        console.log('Milestones:', milestones);
        // Perform the save action
    };

    return (
        <PageContainer>
            <div className="p-2">
                <h1 className="text-2xl font-bold mb-4">Edit Goal</h1>
                <Label className="block mb-2">Title</Label>
                <div className="flex flex-row gap-2 mb-4">
                    <Input
                        type="text"
                        value={currentGoal?.title}
                        onChange={(e) => updateCurrentGoal('title', e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    <TagsDropdownMenu/>
                </div>

                <div className="mb-4">
                    {currentGoal?.milestones.map((milestone, index) => (
                        <div key={milestone.milestoneid} className="flex w-full items-center mb-2">
                                    <Input
                                        type="text"
                                        value={milestone.description}
                                        onChange={(e) => updateCurrentGoal('milestones', currentGoal.milestones.map(ms => ms.milestoneid === milestone.milestoneid ? { ...ms, description: e.target.value } : ms))}
                                        placeholder={`Milestone ${index + 1}`}
                                        className="flex-grow p-2 border rounded mr-2"
                                    />
                                    <Button size="icon" variant={"secondary"} onClick={() => handleRemoveMilestone(index)}>
                                        <FaRegTrashAlt />
                                    </Button>
                        </div>
                    ))}

                </div>
                <div className='flex flex-row justify-between'>
                    <Button size="sm"  className="gap-2 mt-2" onClick={handleAddMilestone}>
                            <FaPlus /> Add Milestone
                        </Button>

                    <Button size="sm" className="gap-2" onClick={handleSubmit}>
                        Save Goal
                    </Button>
                </div>
            </div>
        </PageContainer>
    );
}

export default EditGoals;