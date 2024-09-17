import React, { useEffect, useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../components/@/ui/button';
import DateLabel from '../../../../components/DateLabel/DateLabel';
import TagLabel from '../../../../components/TagLabel/TagLabel';
import SkeletonCard from '../../../../components/TaskCard/SkeletonCard';
import { Goal } from '../../../api/types/goalTypes';
import { useGoals } from '../useGoals';
import {Progress} from '../../../../components/@/ui/progress';
import './GoalCard.css';
import { Label } from '../../../../components/@/ui/label';
import CheckBox from "../../../../components/CheckBox/CheckBox";
import { UUID } from 'crypto';
import { useScreenSize } from '../../../DisplayContext';


function GoalCard({ goal }: { goal: Goal }) {
    const {
        loading,
        handleMilestoneCompletion
      } = useGoals()

      const navigate = useNavigate()

      function handleEditClick(noteId : UUID) {
        localStorage.setItem('currentGoalId', noteId);
        navigate('/goals/edit');
    }
    const {isDateCollapsed, isTagCompressed} = useScreenSize()

    useEffect(() => {
        const progress = calculateProgress();

        var next_milestone =  goal.milestones
                .filter(milestone => !milestone.completed)
                .sort((a, b) => a.index - b.index)[0]},[goal.milestones]) //recalculate progressbars on milestone change


    const calculateProgress = () => {
        const sortedMilestones = [...goal.milestones].sort((a, b) => a.index - b.index);
        const completedMilestones = sortedMilestones.filter(milestone => milestone.completed).length;
        return (completedMilestones / sortedMilestones.length) * 100;
        };

    const progress = calculateProgress();

    var next_milestone =  goal.milestones
            .filter(milestone => !milestone.completed)
            .sort((a, b) => a.index - b.index)[0]

    if (loading) {
          return <SkeletonCard />;
        }

    return (
            <div className='p-3 w-full rounded-xl border-[2px]'>
                <div className='flex flex-row items-center gap-3 justify-between'>
                    <div className='flex flex-row items-center gap-3'>
                        <h3 className="goal-title">{goal.title}</h3>
                    </div>
                    <div className='flex flex-row items-center gap-1'>
                        {goal.due_date && <DateLabel includeTime={false} collapsed={isDateCollapsed} date={goal.due_date} />}
                        {goal.tags.map((tag, index) => (
                            <TagLabel key={index} name={tag.name} color={tag.color} compressed={isTagCompressed} />
                        ))}
                        <Button variant="ghost" size={"icon"} onClick={() => handleEditClick(goal.noteid)}><FaEdit /></Button>
                    </div>
                </div>
                <div className='mt-3'>
                    <Progress value={progress}/>
                        {next_milestone && (
                            <div className='pt-4 flex flex-col gap-3'>
                                    <Label>Next milestone</Label>
                                    <div className='flex flex-row gap-2'>
                                        <CheckBox checked={next_milestone.completed} onChange={() => handleMilestoneCompletion(goal.goalid, next_milestone.milestoneid)} />
                                        <p className="text-md pl-1 pt-2">
                                            {next_milestone.description}
                                        </p>
                                    </div>
                            </div>
                            )}
                </div>
                {goal.content && <p className="text-md pl-1 pt-2">{goal.content}</p>}
            </div>
        );
    }

    export default GoalCard;