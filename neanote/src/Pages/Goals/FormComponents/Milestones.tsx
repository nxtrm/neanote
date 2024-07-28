import React, { useEffect, useMemo, useState } from 'react';
import { Goal } from '../../../api/types/goalTypes';
import { useGoals } from '../useGoals';
import CheckBox from '../../../../components/CheckBox/CheckBox';
import { Input } from '../../../../components/@/ui/input';
import { FaRegTrashAlt } from 'react-icons/fa';
import { Button } from '../../../../components/@/ui/button';
import { Skeleton } from '../../../../components/@/ui/skeleton';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MdDragIndicator } from "react-icons/md";


function Milestones({ goal }: { goal: Goal }) {
    const { section, updateCurrentGoal, handleRemoveMilestone, handleMilestoneCompletion, pendingChanges, validationErrors } = useGoals();
    const milestonesId = useMemo(() => goal.milestones.map((ms) => ms.milestoneid), [goal.milestones]);
  
    const onDragEnd = (event) => {
      const { active, over } = event;
      if (active.id !== over.id) {
        const oldIndex = milestonesId.indexOf(active.id);
        const newIndex = milestonesId.indexOf(over.id);
        const newMilestones = arrayMove(goal.milestones, oldIndex, newIndex).map((milestone, index) => ({
          ...milestone,
          index,
        }));
        updateCurrentGoal('milestones', newMilestones);
      }
    };

    useEffect(() => {
        console.log(pendingChanges, validationErrors)
    })
  
    return (
      <DndContext onDragEnd={onDragEnd} collisionDetection={closestCenter}>
        <SortableContext items={milestonesId}>
          {goal.milestones
            .slice()
            .sort((a, b) => a.index - b.index)
            .map((milestone) => (
              <SortableItem
                key={milestone.milestoneid}
                milestone={milestone}
                section={section}
                goal={goal}
                handleRemoveMilestone={handleRemoveMilestone}
                handleMilestoneCompletion={handleMilestoneCompletion}
                updateCurrentGoal={updateCurrentGoal}
              />
            ))}
        </SortableContext>
      </DndContext>
    );
  }
  
  function SortableItem({ milestone, section, goal, handleRemoveMilestone, handleMilestoneCompletion, updateCurrentGoal }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: milestone.milestoneid });
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    // if (isDragging) {
    //     return (
    //     <Skeleton className='flex h-10 w-full'/>

    //     )
    // }
  
    return (
      <div ref={setNodeRef} style={style} {...attributes} className="flex w-full items-center mb-2">
        <MdDragIndicator size={"25px"} className="cursor-grab mr-1"  {...listeners}/>
        {section === 'edit goal' && (
          <div className="mr-2">
            <CheckBox
              checked={milestone.completed}
              onChange={() => handleMilestoneCompletion(goal.goalid, milestone.milestoneid)}
            />
          </div>
        )}
        <Input
          type="text"
          value={milestone.description}
          onChange={(e) =>
            updateCurrentGoal(
              'milestones',
              goal.milestones.map((ms) =>
                ms.milestoneid === milestone.milestoneid ? { ...ms, description: e.target.value } : ms
              )
            )
          }
          placeholder={milestone.index === 0 ? 'Starting Point' : `Milestone ${milestone.index}`}
          className="flex-grow p-2 border rounded mr-2"
        />
        <Button
          size="icon"
          variant={'secondary'}
          disabled={milestone.index === 0 || milestone.index === goal.milestones.length - 1}
          onClick={() => handleRemoveMilestone(milestone.milestoneid)}
        >
          <FaRegTrashAlt />
        </Button>
      </div>
    );
  }

export default Milestones;