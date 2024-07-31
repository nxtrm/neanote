import { PopoverContent } from '@radix-ui/react-popover'
import React, { useState } from 'react'
import { Button } from '../../../../components/@/ui/button'
import { Card, CardDescription } from '../../../../components/@/ui/card'
import { Input } from '../../../../components/@/ui/input'
import { Popover, PopoverTrigger } from '../../../../components/@/ui/popover'
import { useHabits } from '../useHabits'

function TimeSelector() {
    const {currentHabit, updateCurrentHabit} = useHabits();
    const [selectedTime, setSelectedTime] = useState(''); //convert it to a store
    const buttons = ['daily', 'weekly', 'monthly']
  
    const handleTimeSelect = (time) => {
      updateCurrentHabit('reminder', {'reminder_time' : time, 'repetition': currentHabit?.reminder.repetition});
      setSelectedTime(time);
    };
  
  
    return (
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={"secondary"}>
              Repeats:
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 z-50">
            <Card className="w-[120px] h-[200px] ">
              <CardDescription className='flex flex-col p-2 gap-y-2 justify-center'>
                <Input 
                  type="time" 
                  value={currentHabit?.reminder.reminder_time}
                  onChange={(e) => handleTimeSelect(e.target.value)} 
                  className="flex text-center justify-center" 
                />
                {buttons.map((period) => (
                  <Button
                    key={period}
                    variant={currentHabit?.reminder.repetition === period ? 'default' : 'secondary'}
                    onClick={() => updateCurrentHabit('reminder', {'reminder_time' : currentHabit?.reminder.reminder_time , 'repetition': period})}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Button>
                ))}
              </CardDescription>
            </Card>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

export default TimeSelector