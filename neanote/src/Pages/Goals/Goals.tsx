import React, { useEffect, useState } from 'react'
import PageContainer from '../../../components/PageContainer/PageContainer'
import { Button } from '../../../components/@/ui/button'
import { FaPlus } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom';
import { useGoals } from './useGoals';
import GoalCard from './GoalCard/GoalCard';

function Goals() {
  const navigate = useNavigate(); 
  const {resetCurrentGoal, goalPreviews, fetchGoalPreviews, setSection} = useGoals();

  const handleAddGoalClick = () => {
        resetCurrentGoal();
        setSection('create');
        navigate('/goals/create')
  }
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  useEffect(() => {
    const fetchIfNeeded = () => {
      // Check if never fetched or if 5 minutes have passed since the last fetch
      if (!lastFetchTime || new Date().getTime() - lastFetchTime.getTime() > 300000) {
        fetchGoalPreviews(1);
        setLastFetchTime(new Date());
      }
    };

    fetchIfNeeded();

    // Set up a timer to refetch every 5 minutes
    const intervalId = setInterval(fetchIfNeeded, 300000);

  // Clean up the interval on component unmount
  return () => clearInterval(intervalId);
}, [fetchGoalPreviews, lastFetchTime]);

  return (
    <PageContainer>
        <div className="px-1 py-1">
            <div className="flex flex-row justify-between pb-2">
              <p className="pl-1 text-2xl font-bold">Goals</p>
              <Button size="sm" className="gap-2" onClick={handleAddGoalClick}>
                  <FaPlus />
                  Add Goal
              </Button>
            </div>
            <div className="flex flex-col gap-3">
                {goalPreviews.map((goal) => (
                    <div key={goal.goalid} >
                            <GoalCard goal={goal}/>
                    </div>))}
            </div>
        </div>
    </PageContainer>
  )
}

export default Goals