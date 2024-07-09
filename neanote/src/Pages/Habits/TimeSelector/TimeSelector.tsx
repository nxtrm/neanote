import React, { useState } from 'react'
import { Popover, PopoverTrigger } from '../../../../components/@/ui/popover'
import { Button } from '../../../../components/@/ui/button'
import {RadioGroup, RadioGroupItem}  from '../../../../components/@/ui/radio-group'
import {Card, CardHeader,CardDescription,} from '../../../../components/@/ui/card'
import { PopoverContent } from '@radix-ui/react-popover'
import { Input } from '../../../../components/@/ui/input'
import { Label } from '../../../../components/@/ui/label'

function TimeSelector() {
    const [selectedTime, setSelectedTime] = useState(''); //convert it to a store
    const [repetition, setRepetition] = useState('daily');
  
    const handleTimeSelect = (time) => {
      setSelectedTime(time);
    };
  
    const handleRepetitionChange = (value) => {
      setRepetition(value);
    };
  
    return (
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={"secondary"}>
              Repeats:
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <Card className="w-[150px] h-[200px]">
              <CardHeader>
                <Input 
                  type="time" 
                  value={selectedTime}
                  onChange={(e) => handleTimeSelect(e.target.value)} 
                  className="flex justify-center" 
                />
              </CardHeader>
              <CardDescription className='flex justify-center'>
                <RadioGroup defaultValue="daily" value={repetition} onChange={handleRepetitionChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily">Daily</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly">Weekly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly">Monthly</Label>
                  </div>
                </RadioGroup>
              </CardDescription>
            </Card>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

export default TimeSelector