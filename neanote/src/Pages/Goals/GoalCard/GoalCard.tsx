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

function GoalCard({ goal }: { goal: Goal }) { 
    const {

        setSection,
        loading,
      } = useGoals()
  
      const navigate = useNavigate()
  
      function handleEditClick(noteId) {
        setSection('edit');
        localStorage.setItem('currentGoalId', noteId.toString());
        navigate('/goals/edit');
    }
  
      const [screenSize, setScreenSize] = useState('large'); 
  
      useEffect(() => {
        const handleResize = () => {
          if (window.innerWidth < 650) {
            setScreenSize('small');
          } else if (window.innerWidth >= 650 && window.innerWidth < 1024) {
            setScreenSize('medium');
          } else {
            setScreenSize('large');
          }
        };
        handleResize();
    
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }, []);
    
      const isDateCollapsed = screenSize === 'small';
      const isTagCompressed = screenSize !== 'large';

      const calculateProgress = () => {
        const sortedMilestones = [...goal.milestones].sort((a, b) => a.index - b.index);
        const completedMilestones = sortedMilestones.filter(milestone => milestone.completed).length;
        return (completedMilestones / sortedMilestones.length) * 100;
        };

      const progress = calculateProgress();
    
  
        
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
                        {goal.due_date && <DateLabel collapsed={isDateCollapsed} date={goal.due_date} />}
                        {goal.tags.map((tag, index) => (
                            <TagLabel key={index} name={tag.name} color={tag.color} compressed={isTagCompressed} />
                        ))}
                        <Button variant="ghost" size={"icon"} onClick={() => handleEditClick(goal.noteid)}><FaEdit /></Button>
                    </div>
                </div>
                {goal.content && <p className="text-md pl-1 pt-2">{goal.content}</p>}
                <div className='mt-2'>
                    <Progress value={progress}/>
                    <p className="text-sm text-right">{`${progress.toFixed(0)}% Complete`}</p>
                </div>
            </div>
        );
    }
    
    export default GoalCard;