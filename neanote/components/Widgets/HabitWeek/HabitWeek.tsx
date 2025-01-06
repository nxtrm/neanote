
import React from 'react';

interface HabitWeekProps {
    data: boolean[];
}

const HabitWeek: React.FC<HabitWeekProps> = ({ data }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            {data.map((filled, index) => (
                filled ? <div
                    key={index}
                    className='rounded-full w-[30px] h-[30px] bg-primary '/> :
                        <div
                    key={index}
                    className='rounded-full w-[30px] h-[30px] bg-secondary '/>
            ))}
        </div>
    );
};

export default HabitWeek;