import React from 'react'
import { Goal } from '../../../api/types/goalTypes'
import { useGoals } from '../useGoals'
import CheckBox from '../../../../components/CheckBox/CheckBox'
import { Input } from '../../../../components/@/ui/input'
import { FaRegTrashAlt } from 'react-icons/fa'
import { Button } from '../../../../components/@/ui/button'

function Milestones({goal}: { goal: Goal}) {
  const {section, updateCurrentGoal, handleRemoveMilestone, handleMilestoneCompletion, currentGoal} = useGoals()
  return (
    <div>
        {goal.milestones
            .slice()
            .sort((a, b) => a.index - b.index)
            .map((milestone) => (
                <div key={milestone.milestoneid} className="flex w-full items-center mb-2">
                        {section == "edit goal" &&
                            <div className='mr-2'>
                            <CheckBox 
                                checked={milestone.completed} 
                                onChange={() => handleMilestoneCompletion(goal.goalid, milestone.milestoneid)} />
                            </div>}
                            <Input
                                type="text"
                                value={milestone.description}
                                onChange={(e) => updateCurrentGoal('milestones', goal.milestones.map(ms => ms.milestoneid === milestone.milestoneid ? { ...ms, description: e.target.value } : ms))}
                                placeholder={milestone.index === 0 || milestone.index === goal.milestones.length - 1   ? "Starting Point" : `Milestone ${milestone.index + 1}`}
                                className="flex-grow p-2 border rounded mr-2"
                                />
                            <Button size="icon" variant={"secondary"} 
                                    disabled={
                                        milestone.index === 0 || // First item
                                        milestone.index === goal.milestones.length - 1 // Last item
                                    } 
                                    onClick={() => handleRemoveMilestone(milestone.milestoneid)}>
                                <FaRegTrashAlt />
                            </Button>
                                    
                </div>
            ))}
        </div>
  )
}

export default Milestones