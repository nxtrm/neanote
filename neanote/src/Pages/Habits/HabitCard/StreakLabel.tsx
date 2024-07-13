import React from 'react'

interface Props {
    streak: number
    completed_today: boolean
}

function StreakLabel({ streak, completed_today }: Props) {
  
    const additionalStyles = completed_today ? {
      boxShadow: '0 0 5px #32cd32', // Glow effect for completion today
      color: '#fff', 
      backgroundColor: '#32cd32',
    } : {};
  
    return (
      <div
        style={{
          textAlign: 'center',
          ...additionalStyles, 
        }}
        className='text-sm text-primary bg-secondary h-6 flex items-center p-2 rounded-md'
      >
        {`Streak: ${streak}`}
      </div>
    );
  }
  
  export default StreakLabel;