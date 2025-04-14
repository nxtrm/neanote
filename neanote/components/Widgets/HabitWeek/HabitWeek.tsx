
import React from 'react';

interface HabitWeekProps {
    data: boolean[];
    title?: string;
}



const HabitWeek: React.FC<HabitWeekProps> = ({ data,title }) => {
    return (
        <div className='flex-col' style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            <div className='flex flex-row gap-2'>

            {data.map((filled, index) => (
                filled ? <div
                key={index}
                className='rounded-full w-[30px] h-[30px] bg-primary '/> :
                <div
                key={index}
                className='rounded-full w-[30px] h-[30px] bg-secondary '/>
            ))}
            </div>
        </div>
    );
};

export default HabitWeek;